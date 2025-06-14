using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using DENTMED_API.Services;
using System.Net;

namespace DENTMED_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ruta će biti /api/camunda

    public class CamundaController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _camundaRestApiBaseUrl;
        private readonly ILogger<CamundaController> _logger;
        private readonly CamundaWorkerService _camundaWorkerService; // Inject CamundaWorkerService

        // Konstruktor s Dependency Injectionom za HttpClientFactory, IConfiguration i ILogger
        public CamundaController(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<CamundaController> logger,
            CamundaWorkerService camundaWorkerService) // CamundaWorkerService u konstruktor
        {
            _httpClient = httpClientFactory.CreateClient("CamundaClient");
            _camundaRestApiBaseUrl = "http://localhost:8080/engine-rest";
            _logger = logger;
            _camundaWorkerService = camundaWorkerService; // Inicijalizacija injectanog servisa
        }

        // DTO (Data Transfer Object) za dolazne podatke za pokretanje procesa
        public class StartProcessRequest
        {
            public string PatientName { get; set; }
            public string PatientEmail { get; set; }
        }

        [HttpPost("startAppointmentProcess")] // Ruta će biti /api/camunda/startAppointmentProcess
        public async Task<IActionResult> StartAppointmentProcess([FromBody] StartProcessRequest request)
        {
            var processDefinitionKey = "zakazivanje_termina"; // Ključ BPMN procesa (iz BPMN dijagrama)

            var payload = new
            {
                // Varijable koje prosljeđujemo Camundi
                variables = new
                {
                    patientName = new { value = request.PatientName, type = "String" },
                    patientEmail = new { value = request.PatientEmail, type = "String" }
                },
                businessKey = request.PatientEmail
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                _logger.LogInformation($"Attempting to start Camunda process '{processDefinitionKey}' with payload: {jsonPayload}");
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/process-definition/key/{processDefinitionKey}/start", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var camundaResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var processInstanceId = camundaResponse.GetProperty("id").GetString();
                    _logger.LogInformation($"Successfully started Camunda process. Instance ID: {processInstanceId}");
                    return Ok(new { message = "Proces uspješno pokrenut!", processInstanceId });
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"FAILED to start Camunda process '{processDefinitionKey}'. Status: {response.StatusCode}. Content: {errorContent}");
                    return StatusCode((int)response.StatusCode, new { message = $"Greška pri pokretanju procesa u Camundi: {errorContent}" });
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"Mrežna greška pri komunikaciji s Camundom prilikom pokretanja procesa: {ex.Message}");
                return StatusCode(500, new { message = $"Mrežna greška pri komunikaciji s Camundom: {ex.Message}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Došlo je do neočekivane greške prilikom pokretanja procesa: {ex.Message}");
                return StatusCode(500, new { message = $"Došlo je do neočekivane greške: {ex.Message}" });
            }
        }

        // DTO za User Task
        public class UserTaskDto
        {
            public string Id { get; set; }
            public string Name { get; set; }
            public string ProcessInstanceId { get; set; }
            public Dictionary<string, object> Variables { get; set; } // Varijable taska
        }

        // Endpoint za dohvat aktivnih User Taskova za instancu procesa 
        [HttpGet("user-tasks/{processInstanceId}")]
        public async Task<IActionResult> GetUserTasksByProcessInstance(string processInstanceId)
        {
            try
            {
                var requestUrl = $"{_camundaRestApiBaseUrl}/task?processInstanceId={processInstanceId}&active=true";
                _logger.LogInformation($"Dohvaćam korisničke zadatke s Camunde: {requestUrl}");

                var response = await _httpClient.GetAsync(requestUrl);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation($"Uspješno dohvaćeni korisnički zadaci (raw response): {responseContent}");
                    var camundaTasks = JsonSerializer.Deserialize<List<JsonElement>>(responseContent);

                    var userTasks = new List<UserTaskDto>();
                    foreach (var taskElement in camundaTasks)
                    {
                        if (!taskElement.TryGetProperty("id", out JsonElement taskIdElement) ||
                            !taskElement.TryGetProperty("name", out JsonElement taskNameElement) ||
                            !taskElement.TryGetProperty("processInstanceId", out JsonElement taskProcessInstanceIdElement))
                        {
                            _logger.LogWarning("Task element ne sadrži sve potrebne property-e: id, name, processInstanceId.");
                            continue;
                        }

                        var taskId = taskIdElement.GetString();
                        var taskName = taskNameElement.GetString();
                        var taskProcessInstanceId = taskProcessInstanceIdElement.GetString();

                        var variablesResponse = await _httpClient.GetAsync($"{_camundaRestApiBaseUrl}/task/{taskId}/variables");
                        if (variablesResponse.IsSuccessStatusCode)
                        {
                            var variablesContent = await variablesResponse.Content.ReadAsStringAsync();
                            _logger.LogInformation($"Varijable za zadatak {taskId}: {variablesContent}");
                            var taskVariables = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(variablesContent);

                            var mappedVariables = new Dictionary<string, object>();
                            foreach (var variable in taskVariables)
                            {
                                if (variable.Value.TryGetProperty("value", out JsonElement valueElement))
                                {
                                    if (variable.Key == "availableAppointments" && valueElement.ValueKind == JsonValueKind.String)
                                    {
                                        try
                                        {
                                            mappedVariables[variable.Key] = JsonSerializer.Deserialize<List<string>>(valueElement.GetString());
                                        }
                                        catch (JsonException ex)
                                        {
                                            _logger.LogError(ex, $"Nije uspjela deserializacija 'availableAppointments' stringa: {valueElement.GetString()}");
                                            mappedVariables[variable.Key] = valueElement.GetString();
                                        }
                                    }
                                    else
                                    {
                                        mappedVariables[variable.Key] = GetValueFromJsonElement(valueElement);
                                    }
                                }
                            }

                            userTasks.Add(new UserTaskDto
                            {
                                Id = taskId,
                                Name = taskName,
                                ProcessInstanceId = taskProcessInstanceId,
                                Variables = mappedVariables
                            });
                        }
                        else
                        {
                            var errorVariablesContent = await variablesResponse.Content.ReadAsStringAsync();
                            _logger.LogError($"Nije uspio dohvatiti varijable za zadatak {taskId}: {variablesResponse.StatusCode}. Sadržaj: {errorVariablesContent}");
                            userTasks.Add(new UserTaskDto
                            {
                                Id = taskId,
                                Name = taskName,
                                ProcessInstanceId = taskProcessInstanceId,
                                Variables = new Dictionary<string, object>()
                            });
                        }
                    }

                    return Ok(userTasks);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Nije uspio dohvatiti korisničke zadatke iz Camunde. Status: {response.StatusCode}. Sadržaj: {errorContent}");
                    return StatusCode((int)response.StatusCode, new { message = $"Greška pri dohvatu zadataka iz Camunde: {errorContent}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Došlo je do neočekivane greške prilikom dohvaćanja korisničkih zadataka.");
                return StatusCode(500, new { message = $"Došlo je do neočekivane greške: {ex.Message}" });
            }
        }

        // Pomoćna funkcija za dohvaćanje vrijednosti iz JsonElement (već postoji)
        private object GetValueFromJsonElement(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                JsonValueKind.Array => JsonSerializer.Deserialize<List<object>>(element.GetRawText()),
                JsonValueKind.Object => JsonSerializer.Deserialize<Dictionary<string, object>>(element.GetRawText()),
                _ => element.GetRawText()
            };
        }

        public class CompleteTaskRequest
        {
            public Dictionary<string, CamundaVariable> Variables { get; set; }
        }

        // Endpoint za dovršetak User Taska 
        [HttpPost("complete-user-task/{taskId}")]
        public async Task<IActionResult> CompleteUserTask(string taskId, [FromBody] CompleteTaskRequest request)
        {
            try
            {
                var payload = new
                {
                    workerId = "frontend-worker", // Identifikator workera
                    variables = request.Variables
                };

                var jsonPayload = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _logger.LogInformation($"Pokušavam dovršiti korisnički zadatak '{taskId}' s payloadom: {jsonPayload}");

                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/task/{taskId}/complete", content);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"Korisnički zadatak '{taskId}' uspješno dovršen.");
                    return Ok(new { message = "Korisnički zadatak uspješno dovršen!" });
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Nije uspio dovršiti korisnički zadatak '{taskId}'. Status: {response.StatusCode}. Sadržaj: {errorContent}");
                    return StatusCode((int)response.StatusCode, new { message = $"Greška pri dovršetku zadatka u Camundi: {errorContent}" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Došlo je do neočekivane greške prilikom dovršetka korisničkog zadatka '{taskId}'.");
                return StatusCode(500, new { message = $"Došlo je do neočekivane greške: {ex.Message}" });
            }
        }

        // Endpoint za potvrdu termina od strane pacijenta
        public class AppointmentConfirmationDto
        {
            public string PatientEmail { get; set; }
            public bool IsConfirmed { get; set; }
        }

        [HttpPost("confirm-appointment")]
        public async Task<IActionResult> ConfirmAppointment([FromBody] AppointmentConfirmationDto confirmation)
        {
            _logger.LogInformation($"Received confirmation for patient {confirmation.PatientEmail}: {confirmation.IsConfirmed}");

            try
            {
                // Pozivamo CorrelateMessageFromPatient iz CamundaWorkerService
                await _camundaWorkerService.CorrelateMessageFromPatient(
                    confirmation.PatientEmail,
                    confirmation.IsConfirmed,
                    HttpContext.RequestAborted); // Proslijedi CancellationToken iz HTTP konteksta

                return Ok(new { Message = "Confirmation message sent to Camunda." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error correlating appointment confirmation for {confirmation.PatientEmail}.");
                return StatusCode(500, new { Message = $"Error sending confirmation to Camunda: {ex.Message}" });
            }
        }


        public class ProcessInstanceStatus
        {
            public string Id { get; set; }
            public bool Ended { get; set; }
            public bool Suspended { get; set; }
        }

        // Endpoint za provjeru statusa procesne instance

        [HttpGet("process-instance-active/{processInstanceId}")]
        public async Task<IActionResult> IsProcessInstanceActive(string processInstanceId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_camundaRestApiBaseUrl}/process-instance/{processInstanceId}");

                if (response.IsSuccessStatusCode)
                {
                    // PROČITAJ SADRŽAJ ODGOVORA KAO JSON
                    var jsonContent = await response.Content.ReadAsStringAsync();
                    var processInstanceData = JsonSerializer.Deserialize<ProcessInstanceStatus>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    // Provjeri polje "Ended" iz Camunda odgovora
                    if (processInstanceData != null && !processInstanceData.Ended)
                    {
                        // Ako je instanca pronađena i NIJE završena, onda je aktivna
                        return Ok(true);
                    }
                    else
                    {
                        // Ako je instanca pronađena, ali je završena (Ended == true)
                        // ili ako se ne može deserializirati, smatramo je neaktivnom
                        return Ok(false);
                    }
                }
                else if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    // Ako je 404 Not Found, instanca ne postoji (završena je i možda obrisana)
                    // Stoga nije aktivna.
                    return Ok(false);
                }
                else
                {
                    // Za ostale statuse, baci grešku
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Error checking process instance status for {processInstanceId}. Status: {response.StatusCode}. Content: {errorContent}");
                    return StatusCode((int)response.StatusCode, $"Error checking process instance status: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"Network error while checking process instance status for {processInstanceId}: {ex.Message}");
                return StatusCode(500, $"Network error while checking process instance status: {ex.Message}");
            }
            catch (JsonException ex) // Dodajte hvatanje greške pri deserializaciji JSON-a
            {
                _logger.LogError(ex, $"JSON deserialization error while checking process instance status for {processInstanceId}: {ex.Message}");
                return StatusCode(500, $"JSON deserialization error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An unexpected error occurred while checking process instance status for {processInstanceId}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}