using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DENTMED_API.Interfaces;

namespace DENTMED_API.Services
{
    // DTO za Camunda varijable
    public class CamundaVariable
    {
        [JsonPropertyName("value")]
        public object Value { get; set; }
        [JsonPropertyName("type")]
        public string Type { get; set; }
    }

    public class CamundaWorkerService : BackgroundService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CamundaWorkerService> _logger;
        private readonly string _camundaRestApiBaseUrl;
        private readonly TimeSpan _pollingInterval;
        private readonly int _lockDuration;

        private readonly IMockTerminService _mockTerminService;

        public CamundaWorkerService(HttpClient httpClient, IConfiguration configuration, ILogger<CamundaWorkerService> logger, IMockTerminService mockTerminService)
        {
            _httpClient = httpClient;
            _camundaRestApiBaseUrl = configuration["Camunda:RestApiBaseUrl"] ?? "http://localhost:8080/engine-rest";
            _pollingInterval = TimeSpan.FromSeconds(int.Parse(configuration["Camunda:PollingIntervalSeconds"] ?? "5"));
            _lockDuration = int.Parse(configuration["Camunda:LockDurationMilliseconds"] ?? "10000"); // 10 sekundi
            _logger = logger;
            _mockTerminService = mockTerminService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Camunda Worker Service running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await FetchAndLockTasks("provjera_dostupnih_termina", stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Task was cancelled, likely due to application shutdown
                    _logger.LogInformation("Camunda Worker Service is stopping due to cancellation.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while fetching and locking tasks.");
                }

                await Task.Delay(_pollingInterval, stoppingToken);
            }
        }

        private async Task FetchAndLockTasks(string topicName, CancellationToken stoppingToken)
        {
            var payload = new
            {
                workerId = "dentmed-worker",
                maxTasks = 1,
                usePriority = true,
                asyncResponseTimeout = 5000,
                topics = new[]
                {
                    new
                    {
                        topicName = topicName,
                        lockDuration = _lockDuration,
                        variables = new [] { "patientName", "patientEmail", "availableAppointments", "selectedAppointment" } // Varijable koje želimo dohvatiti
                    }
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/external-task/fetchAndLock", content, stoppingToken);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var tasks = JsonSerializer.Deserialize<List<JsonElement>>(responseContent);

                if (tasks != null && tasks.Any())
                {
                    foreach (var task in tasks)
                    {
                        string taskId = task.GetProperty("id").GetString();
                        string processInstanceId = task.GetProperty("processInstanceId").GetString();
                        _logger.LogInformation($"Fetched and locked task: {topicName}, Task ID: {taskId}, Process Instance ID: {processInstanceId}");

                        // Ovdje provjeravamo topicName i pozivamo odgovarajuću logiku
                        if (topicName == "provjera_dostupnih_termina")
                        {
                            await HandleCheckAvailableAppointmentsTask(taskId, processInstanceId, task, stoppingToken);
                        }
                    }
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error while fetching tasks for topic '{topicName}': {ex.Message}");
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, $"JSON deserialization error while fetching tasks for topic '{topicName}': {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An unexpected error occurred while fetching tasks for topic '{topicName}'.");
            }
        }

        private async Task HandleCheckAvailableAppointmentsTask(string taskId, string processInstanceId, JsonElement task, CancellationToken stoppingToken)
        {
            _logger.LogInformation($"Handling 'check_available_appointments' for task ID: {taskId}");

            try
            {
                int smjenaId = 1;
                var datum = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
                int trajanje = 30;

                var termini = await _mockTerminService.GetMockTerminBySmjenaIdAsync(smjenaId, datum, trajanje);

                // Pretvori u string prikaz termina za Camundu
                var availableAppointments = termini
                    .Select(t => $"{t.pocetak:dd.MM.yyyy HH:mm} - {t.kraj:HH:mm}")
                    .ToList();

                var jsonAppointments = JsonSerializer.Serialize(availableAppointments);

                var variables = new Dictionary<string, CamundaVariable>
                {
                    { "availableAppointments", new CamundaVariable { Value = jsonAppointments, Type = "String" } }
                };

                await CompleteExternalTask(taskId, processInstanceId, variables, stoppingToken);
                _logger.LogInformation($"Completed 'provjera_dostupnih_termina' task {taskId}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to handle 'provjera_dostupnih_termina' for task ID: {taskId}");
                await HandleFailure(taskId, processInstanceId, "Failed to check available appointments", stoppingToken);
            }
        }

        private async Task CompleteExternalTask(string taskId, string processInstanceId, Dictionary<string, CamundaVariable> variables, CancellationToken stoppingToken)
        {
            var payload = new
            {
                workerId = "dentmed-worker",
                variables = variables
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/external-task/{taskId}/complete", content, stoppingToken);
                response.EnsureSuccessStatusCode();
                _logger.LogInformation($"Successfully completed external task {taskId} for process instance {processInstanceId}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to complete external task {taskId} for process instance {processInstanceId}.");
                throw; // Rethrow to be caught by the outer catch block
            }
        }

        private async Task HandleFailure(string taskId, string processInstanceId, string errorMessage, CancellationToken stoppingToken)
        {
            var payload = new
            {
                workerId = "dentmed-worker",
                errorMessage = errorMessage,
                retries = 0, // nema ponovnog pokusaja
                errorDetails = $"Failed to process task {taskId}: {errorMessage}"
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/external-task/{taskId}/bpmnError", content, stoppingToken);
                response.EnsureSuccessStatusCode();
                _logger.LogInformation($"Reported BPMN error for task {taskId}: {errorMessage}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to report BPMN error for task {taskId}.");
            }
        }

        // Metoda za korelaciju poruke od pacijenta
        public async Task CorrelateMessageFromPatient(string patientEmail, bool isConfirmed, CancellationToken cancellationToken)
        {
            string messageName = "potvrda"; // odgovara Message nameu u BPMN dijagramu

            var processVariables = new Dictionary<string, CamundaVariable>
            {
                { "statusPotvrde", new CamundaVariable { Value = isConfirmed, Type = "Boolean" } }
            };

            var payload = new
            {
                messageName = messageName,
                businessKey = patientEmail, // Koristimo patientEmail kao businessKey za korelaciju
                processVariables = processVariables
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                _logger.LogInformation($"Attempting to correlate message '{messageName}' for business key '{patientEmail}' with payload: {jsonPayload}");
                var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/message", content, cancellationToken);
                response.EnsureSuccessStatusCode();
                _logger.LogInformation($"Successfully correlated message '{messageName}' for business key '{patientEmail}'.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP request error while correlating message '{messageName}' for business key '{patientEmail}': {ex.Message}");
                throw; // Re-throw to be handled by the controller
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An unexpected error occurred while correlating message '{messageName}' for business key '{patientEmail}'.");
                throw; // Re-throw to be handled by the controller
            }
        }
    }
}