// Controllers/CamundaController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System; // Za Guid
using Microsoft.Extensions.Logging;
using System.Linq;

namespace DENTMED_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ruta će biti /api/camunda
    public class CamundaController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _camundaRestApiBaseUrl;
        private readonly ILogger<CamundaController> _logger;

        // Konstruktor s Dependency Injectionom za HttpClientFactory i IConfiguration
        public CamundaController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<CamundaController> logger)
        {
            // Dohvaćamo HttpClient instancu konfiguriranu s "CamundaClient"
            _httpClient = httpClientFactory.CreateClient("CamundaClient");
            _camundaRestApiBaseUrl = "http://localhost:8080/engine-rest";
            _logger = logger;
        }

        // DTO (Data Transfer Object) za dolazne podatke
        public class StartProcessRequest
        {
            public string PatientName { get; set; }
            public string PatientEmail { get; set; }
        }

        [HttpPost("startAppointmentProcess")] // Ruta će biti /api/camunda/startAppointmentProcess
        public async Task<IActionResult> StartAppointmentProcess([FromBody] StartProcessRequest request)
        {
            // Ključ tvog BPMN procesa (iz BPMN dijagrama, Properties Panel, General -> ID)
            var processDefinitionKey = "zakazivanje_termina"; // Koristi ID tvojeg Start Eventa ili Process Definicije
            //var tenantId = "zakazivanje_termina";
            var payload = new
            {
                // Varijable koje prosljeđuješ Camundi
                variables = new
                {
                    patientName = new { value = request.PatientName, type = "String" },
                    patientEmail = new { value = request.PatientEmail, type = "String" }

                },
                // Opcionalno: Business Key za lakše pronalaženje instance procesa kasnije
                businessKey = Guid.NewGuid().ToString() // Generira jedinstveni ID za ovu instancu procesa
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                _logger.LogInformation($"Attempting to start Camunda process '{processDefinitionKey}' with payload: {jsonPayload}");
                // Poziv Camunda REST API-ju za pokretanje procesa
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/process-definition/key/{processDefinitionKey}/start", content);
                //var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/process-definition/key/{processDefinitionKey}/start?tenantId={tenantId}", content);
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    // Parsiraj Camunda odgovor da dobiješ ID pokrenute instance procesa
                    var camundaResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var processInstanceId = camundaResponse.GetProperty("id").GetString();
                    _logger.LogInformation($"Successfully started Camunda process. Instance ID: {processInstanceId}");
                    return Ok(new { message = "Proces uspješno pokrenut!", processInstanceId });
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"FAILED to start Camunda process '{processDefinitionKey}'. Status: {response.StatusCode}. Content: {errorContent}"); // <-- AŽURIRANO DETALJNIJE LOGIRANJE
                    // Vrati točnu grešku Reactu
                    return StatusCode((int)response.StatusCode, new { message = $"Greška pri pokretanju procesa u Camundi: {errorContent}" }); // <-- VRAĆAMO DETALJNIJU PORUKU FRONTENDU

                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"Mrežna greška pri komunikaciji s Camundom prilikom pokretanja procesa: {ex.Message}");
                // Hvatanje mrežnih grešaka (npr. Camunda nije pokrenuta ili je URL pogrešan)
                return StatusCode(500, new { message = $"Mrežna greška pri komunikaciji s Camundom: {ex.Message}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Došlo je do neočekivane greške prilikom pokretanja procesa: {ex.Message}");
                // Hvatanje ostalih nepredviđenih grešaka
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

        // NOVI ENDPOINT: Dohvat aktivnih User Taskova za instancu procesa
        // DENTMED_API/Controllers/CamundaController.cs

        // ... (ostatak koda)

        [HttpGet("user-tasks/{processInstanceId}")]
        public async Task<IActionResult> GetUserTasksByProcessInstance(string processInstanceId)
        {
            try
            {
                // IZMIJENJENO: Koristimo GET zahtjev s Query Parametrima
                // Formiramo URL s query parametrima za filtriranje taskova
                var requestUrl = $"{_camundaRestApiBaseUrl}/task?processInstanceId={processInstanceId}&active=true";
                _logger.LogInformation($"Dohvaćam korisničke zadatke s Camunde: {requestUrl}");

                var response = await _httpClient.GetAsync(requestUrl); // <--- KORIŠTENJE GET metode

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation($"Uspješno dohvaćeni korisnički zadaci (raw response): {responseContent}");
                    // Camunda vraća array task objekata.
                    var camundaTasks = JsonSerializer.Deserialize<List<JsonElement>>(responseContent); // Bolje koristiti List<JsonElement>

                    var userTasks = new List<UserTaskDto>();
                    foreach (var taskElement in camundaTasks)
                    {
                        // Provjeri da li Properties postoje prije nego što ih pokušaš dohvatiti
                        if (!taskElement.TryGetProperty("id", out JsonElement taskIdElement) ||
                            !taskElement.TryGetProperty("name", out JsonElement taskNameElement) ||
                            !taskElement.TryGetProperty("processInstanceId", out JsonElement taskProcessInstanceIdElement))
                        {
                            _logger.LogWarning("Task element ne sadrži sve potrebne property-e: id, name, processInstanceId.");
                            continue; // Preskoči ovaj element ako nedostaju ključni podaci
                        }

                        var taskId = taskIdElement.GetString();
                        var taskName = taskNameElement.GetString();
                        var taskProcessInstanceId = taskProcessInstanceIdElement.GetString();

                        // Dohvati varijable za taj task
                        // Ovaj dio je već bio dobar
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
                                        // Generičko mapiranje ostalih varijabli
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
                            // Dodaj task bez varijabli ako ih ne možeš dohvatiti, da ne blokira prikaz ostalih taskova
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

        // Pomoćna funkcija za dohvaćanje vrijednosti iz JsonElement
        private object GetValueFromJsonElement(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.GetDecimal(), // Or GetInt32, GetDouble, etc.
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
            // Varijable koje dolaze od frontenda, npr. {'selectedAppointment': {value: '...', type: 'String'}}
            public Dictionary<string, object> Variables { get; set; }
        }

        // NOVI ENDPOINT: Dovršetak User Taska
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

                var jsonPayload = JsonSerializer.Serialize(payload);
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

    }
}