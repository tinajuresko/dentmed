// Controllers/CamundaController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System; // Za Guid
using Microsoft.Extensions.Logging;

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
    }
}