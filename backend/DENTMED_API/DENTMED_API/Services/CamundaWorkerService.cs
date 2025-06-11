// Services/CamundaWorkerService.cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
// Uklonjen DENTMED_API.Controllers, jer ne koristimo TerminController direktno
using DENTMED_API.Models;
using DENTMED_API.Interfaces; // Dodano za IMockTerminService
using System.Linq;

namespace DENTMED_API.Services
{
    public class CamundaWorkerService : BackgroundService
    {
        private readonly ILogger<CamundaWorkerService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _camundaRestApiBaseUrl;
        private const string WorkerId = "csharp-appointment-worker";
        private readonly IMockTerminService _mockTerminService; // Promijenjeno iz TerminController

        public CamundaWorkerService(
            ILogger<CamundaWorkerService> logger,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IMockTerminService mockTerminService) // Konstruktor sada prima IMockTerminService
        {
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("CamundaClient");
            _camundaRestApiBaseUrl = "http://localhost:8080/engine-rest";
            _mockTerminService = mockTerminService; // Injektiramo mock servis
            _logger.LogInformation($"Camunda Worker Service initialized. Camunda URL: {_camundaRestApiBaseUrl}");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation($"Camunda External Task Worker '{WorkerId}' started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await FetchAndLockTasks("provjera_dostupnih_termina", 5000, 10000, stoppingToken);
                    await FetchAndLockTasks("posalji_ponudu", 5000, 10000, stoppingToken);
                    await FetchAndLockTasks("predlozi_termin", 5000, 10000, stoppingToken);

                    await Task.Delay(2000, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Worker service is stopping due to cancellation request.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred in Camunda Worker Service main loop.");
                    await Task.Delay(5000, stoppingToken);
                }
            }

            _logger.LogInformation($"Camunda External Task Worker '{WorkerId}' stopped.");
        }

        private async Task FetchAndLockTasks(string topic, long lockDuration, long asyncResponseTimeout, CancellationToken stoppingToken)
        {
            var payload = new
            {
                workerId = WorkerId,
                maxTasks = 1,
                usePriority = true,
                asyncResponseTimeout = asyncResponseTimeout,
                topics = new[]
                {
                    new
                    {
                        topicName = topic,
                        lockDuration = lockDuration,
                        variables = new[] { "patientName", "patientEmail", "selectedAppointment", "availableAppointments", "potvrda", "smjenaId", "datumZakazivanja", "trajanjeTermina" } // Dodane varijable koje worker treba
                    }
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{_camundaRestApiBaseUrl}/external-task/fetchAndLock")
                {
                    Content = content
                };
                var response = await _httpClient.SendAsync(requestMessage, stoppingToken);

                if (response.IsSuccessStatusCode)
                {
                    var tasksJson = await response.Content.ReadAsStringAsync();
                    var tasks = JsonSerializer.Deserialize<JsonElement[]>(tasksJson);

                    foreach (var task in tasks)
                    {
                        var taskId = task.GetProperty("id").GetString();
                        var processInstanceId = task.GetProperty("processInstanceId").GetString();
                        var topicName = task.GetProperty("topicName").GetString();
                        var variables = task.GetProperty("variables");

                        _logger.LogInformation($"Fetched task '{taskId}' for Process Instance '{processInstanceId}' on topic '{topicName}'.");

                        try
                        {
                            if (topicName == "provjera_dostupnih_termina")
                            {
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                string patientEmail = variables.GetProperty("patientEmail").GetProperty("value").GetString();

                                // Pokušaj dohvatiti smjenaId, datumZakazivanja, trajanjeTermina iz varijabli
                                int smjenaId = 1; // Default
                                DateOnly datumZakazivanja = DateOnly.FromDateTime(DateTime.Now); // Default
                                int trajanjeTermina = 60; // Default

                                if (variables.TryGetProperty("smjenaId", out JsonElement smjenaIdElement) && smjenaIdElement.TryGetProperty("value", out JsonElement smjenaIdValue) && smjenaIdValue.ValueKind == JsonValueKind.Number)
                                {
                                    smjenaId = smjenaIdValue.GetInt32();
                                }
                                if (variables.TryGetProperty("datumZakazivanja", out JsonElement datumZakazivanjaElement) && datumZakazivanjaElement.TryGetProperty("value", out JsonElement datumZakazivanjaValue) && datumZakazivanjaValue.ValueKind == JsonValueKind.String)
                                {
                                    if (DateOnly.TryParse(datumZakazivanjaValue.GetString(), out DateOnly parsedDate))
                                    {
                                        datumZakazivanja = parsedDate;
                                    }
                                }
                                if (variables.TryGetProperty("trajanjeTermina", out JsonElement trajanjeTerminaElement) && trajanjeTerminaElement.TryGetProperty("value", out JsonElement trajanjeTerminaValue) && trajanjeTerminaValue.ValueKind == JsonValueKind.Number)
                                {
                                    trajanjeTermina = trajanjeTerminaValue.GetInt32();
                                }

                                await ProcessCheckAvailableAppointmentsTask(taskId, processInstanceId, patientName, patientEmail, smjenaId, datumZakazivanja, trajanjeTermina);
                            }
                            else if (topicName == "posalji_ponudu")
                            {
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                string patientEmail = variables.GetProperty("patientEmail").GetProperty("value").GetString();
                                string selectedAppointment = variables.GetProperty("selectedAppointment").GetProperty("value").GetString();
                                await ProcessSendOfferTask(taskId, processInstanceId, patientName, patientEmail, selectedAppointment);
                            }
                            else if (topicName == "predlozi_termin")
                            {
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                await ProcessReselectAppointmentTask(taskId, processInstanceId, patientName);
                            }
                        }
                        catch (Exception taskEx)
                        {
                            _logger.LogError(taskEx, $"Error processing task '{taskId}' on topic '{topicName}'. Reporting failure to Camunda.");
                            await ReportFailure(taskId, "Error processing task", taskEx.Message);
                        }
                    }
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    _logger.LogDebug($"No tasks fetched for topic '{topic}'.");
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Error fetching tasks on topic '{topic}': {response.StatusCode} - {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, $"HTTP Request Error when fetching tasks on topic '{topic}'. Is Camunda running?");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An unexpected error occurred in FetchAndLockTasks for topic '{topic}'.");
            }
        }

        /// <summary>
        /// Simulira provjeru dostupnih termina i dovršava zadatak s rezultatom.
        /// Koristi mock podatke umjesto poziva baze.
        /// </summary>
        private async Task ProcessCheckAvailableAppointmentsTask(string taskId, string processInstanceId, string patientName, string patientEmail, int smjenaId, DateOnly datumZakazivanja, int trajanjeTermina)
        {
            _logger.LogInformation($"Processing 'Provjeri dostupne termine' for {patientName} ({patientEmail})...");

            // Koristi mock servis za dohvat termina
            List<Termin> slobodniTermini = await _mockTerminService.GetMockTerminBySmjenaIdAsync(smjenaId, datumZakazivanja, trajanjeTermina);

            List<string> availableTermsStrings = new List<string>();
            foreach (var termin in slobodniTermini)
            {
                availableTermsStrings.Add($"{termin.pocetak.ToString("dd.MM.yyyy HH:mm")} - {termin.kraj.ToString("HH:mm")}");
            }

            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                { "availableAppointments", new { value = JsonSerializer.Serialize(availableTermsStrings), type = "String", valueInfo = new { serializationDataFormat = "application/json" } } }
            });
            _logger.LogInformation($"'Provjeri dostupne termine' task '{taskId}' completed. Found {availableTermsStrings.Count} mock appointments.");
        }

        private async Task ProcessSendOfferTask(string taskId, string processInstanceId, string patientName, string patientEmail, string selectedAppointment)
        {
            _logger.LogInformation($"Processing 'Pošalji ponudu pacijentu' for {patientName} ({patientEmail}) with appointment {selectedAppointment}.");
            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                { "offerSent", new { value = true, type = "Boolean" } }
            });
            _logger.LogInformation($"'Pošalji ponudu pacijentu' task '{taskId}' completed.");
        }

        private async Task ProcessReselectAppointmentTask(string taskId, string processInstanceId, string patientName)
        {
            _logger.LogInformation($"Processing 'Ponovno predlozi termin' for {patientName}.");
            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                { "reselectionInitiated", new { value = true, type = "Boolean" } }
            });
            _logger.LogInformation($"'Ponovno predlozi termin' task '{taskId}' completed.");
        }

        private async Task CompleteExternalTask(string taskId, Dictionary<string, object> variablesToPass)
        {
            var payload = new
            {
                workerId = WorkerId,
                variables = variablesToPass
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/external-task/{taskId}/complete", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"External Task '{taskId}' completed successfully.");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to complete External Task '{taskId}': {response.StatusCode} - {errorContent}");
            }
        }

        private async Task ReportFailure(string taskId, string errorMessage, string errorDetails)
        {
            var payload = new
            {
                workerId = WorkerId,
                errorMessage = errorMessage,
                errorDetails = errorDetails,
                retries = 0,
                retryTimeout = 10000
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_camundaRestApiBaseUrl}/external-task/{taskId}/failure", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Reported failure for External Task '{taskId}'.");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to report failure for External Task '{taskId}': {response.StatusCode} - {errorContent}");
            }
        }
    }
}