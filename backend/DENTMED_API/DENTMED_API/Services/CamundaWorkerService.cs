// Services/CamundaWorkerService.cs

using Microsoft.Extensions.Hosting; // Za BackgroundService
using Microsoft.Extensions.Logging; // Za ILogger
using Microsoft.Extensions.Configuration; // Za IConfiguration
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

// Važno: Pobrini se da je ovaj namespace točan!
// Ako je tvoj API projekt nazvan npr. "DENTMED_API", onda je ovo ispravno.
namespace DENTMED_API.Services
{
    public class CamundaWorkerService : BackgroundService
    {
        private readonly ILogger<CamundaWorkerService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _camundaRestApiBaseUrl;
        private const string WorkerId = "csharp-appointment-worker"; // Jedinstveni ID za tvoj worker

        // Konstruktor koristi Dependency Injection za ILogger, IHttpClientFactory i IConfiguration
        public CamundaWorkerService(
            ILogger<CamundaWorkerService> logger,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _logger = logger;
            // Koristi named HttpClient ("CamundaClient") koji je konfiguriran u Program.cs
            _httpClient = httpClientFactory.CreateClient("CamundaClient");
            // Dohvati Camunda Base URL iz konfiguracije (appsettings.json)
            _camundaRestApiBaseUrl = "http://localhost:8080/engine-rest";
            _logger.LogInformation($"Camunda Worker Service initialized. Camunda URL: {_camundaRestApiBaseUrl}");
        }

        // Glavna metoda workera koja se izvršava u pozadini
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation($"Camunda External Task Worker '{WorkerId}' started.");

            // Petlja koja neprestano dohvaća i obrađuje zadatke dok se aplikacija ne zaustavi
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Dohvaćanje i zaključavanje za "provjera_dostupnih_termina" topic
                    await FetchAndLockTasks("provjera_dostupnih_termina", 5000, 10000, stoppingToken);

                    // Dohvaćanje i zaključavanje za "posalji_ponudu" topic
                    await FetchAndLockTasks("posalji_ponudu", 5000, 10000, stoppingToken);

                    // Dohvaćanje i zaključavanje za "predlozi_termin" topic
                    await FetchAndLockTasks("predlozi_termin", 5000, 10000, stoppingToken);

                    // Kratka pauza prije novog ciklusa dohvaćanja zadataka
                    await Task.Delay(2000, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Ovo se događa kada se aplikacija gasi
                    _logger.LogInformation("Worker service is stopping due to cancellation request.");
                    break;
                }
                catch (Exception ex)
                {
                    // Logiranje svih ostalih grešaka kako bi se vidjelo što se događa
                    _logger.LogError(ex, "An error occurred in Camunda Worker Service main loop.");
                    // Pričekaj malo prije ponovnog pokušaja da se izbjegne preveliko opterećenje
                    await Task.Delay(5000, stoppingToken);
                }
            }

            _logger.LogInformation($"Camunda External Task Worker '{WorkerId}' stopped.");
        }

        // Metoda za dohvaćanje i zaključavanje vanjskih zadataka od Camunde
        private async Task FetchAndLockTasks(string topic, long lockDuration, long asyncResponseTimeout, CancellationToken stoppingToken)
        {
            var payload = new
            {
                workerId = WorkerId,
                maxTasks = 1, // Dohvaćamo jedan po jedan zadatak
                usePriority = true,
                asyncResponseTimeout = asyncResponseTimeout, // Koliko dugo Camunda čeka odgovor
                topics = new[]
                {
                    new
                    {
                        topicName = topic,
                        lockDuration = lockDuration, // Koliko dugo je zadatak zaključan za ovog workera
                        // Deklariraj varijable koje su ti potrebne iz procesa za obradu zadatka
                        variables = new[] { "patientName", "patientEmail", "selectedAppointment", "availableAppointments", "potvrda" }
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
                // Pošalji zahtjev Camundi
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
                        var variables = task.GetProperty("variables"); // Pristup varijablama zadatka

                        _logger.LogInformation($"Fetched task '{taskId}' for Process Instance '{processInstanceId}' on topic '{topicName}'.");

                        try
                        {
                            // Pozivanje specifične metode za obradu zadatka ovisno o topicu
                            if (topicName == "provjera_dostupnih_termina")
                            {
                                // Izvlačenje potrebnih varijabli iz taska
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                string patientEmail = variables.GetProperty("patientEmail").GetProperty("value").GetString();
                                await ProcessCheckAvailableAppointmentsTask(taskId, processInstanceId, patientName, patientEmail);
                            }
                            else if (topicName == "posalji_ponudu")
                            {
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                string patientEmail = variables.GetProperty("patientEmail").GetProperty("value").GetString();
                                string selectedAppointment = variables.GetProperty("selectedAppointment").GetProperty("value").GetString();
                                await ProcessSendOfferTask(taskId, processInstanceId, patientName, patientEmail, selectedAppointment);
                            }
                            else if (topicName == "predlozi_termin") // ID iz tvog opisa
                            {
                                string patientName = variables.GetProperty("patientName").GetProperty("value").GetString();
                                await ProcessReselectAppointmentTask(taskId, processInstanceId, patientName);
                            }
                        }
                        catch (Exception taskEx)
                        {
                            // Ako dođe do greške unutar obrade zadatka, prijavljujemo je Camundi
                            _logger.LogError(taskEx, $"Error processing task '{taskId}' on topic '{topicName}'. Reporting failure to Camunda.");
                            await ReportFailure(taskId, "Error processing task", taskEx.Message);
                        }
                    }
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    // Nema dostupnih zadataka za ovaj topic, što je normalno
                    _logger.LogDebug($"No tasks fetched for topic '{topic}'.");
                }
                else
                {
                    // Logiranje grešaka pri dohvaćanju zadataka
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Error fetching tasks on topic '{topic}': {response.StatusCode} - {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Logiranje mrežnih grešaka (npr. Camunda nije dostupna)
                _logger.LogError(ex, $"HTTP Request Error when fetching tasks on topic '{topic}'. Is Camunda running?");
            }
            catch (Exception ex)
            {
                // Logiranje ostalih nepredviđenih grešaka
                _logger.LogError(ex, $"An unexpected error occurred in FetchAndLockTasks for topic '{topic}'.");
            }
        }

        // --- Implementacije specifičnih metoda za obradu zadataka ---
        // Ovdje ćeš dodati svoju poslovnu logiku za svaki pojedini Service Task.

        /// <summary>
        /// Simulira provjeru dostupnih termina i dovršava zadatak s rezultatom.
        /// </summary>
        private async Task ProcessCheckAvailableAppointmentsTask(string taskId, string processInstanceId, string patientName, string patientEmail)
        {
            _logger.LogInformation($"Processing 'Provjeri dostupne termine' for {patientName} ({patientEmail})...");
            // Ovdje bi išao STVARNI poziv tvom internom API-ju ili bazi podataka
            // da dobiješ slobodne termine ortodonta.
            List<string> availableTerms = SimulateGetAvailableAppointments();

            // Dovršavanje Camunda External Taska i prosljeđivanje dostupnih termina
            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                // availableAppointments je naziv varijable koja će biti postavljena u Camundi
                { "availableAppointments", new { value = JsonSerializer.Serialize(availableTerms), type = "String", valueInfo = new { serializationDataFormat = "application/json" } } }
            });
            _logger.LogInformation($"'Provjeri dostupne termine' task '{taskId}' completed. Found {availableTerms.Count} appointments.");
        }

        // POMOĆNA METODA: Simulira dohvat termina (zamijeni s pravom logikom!)
        private List<string> SimulateGetAvailableAppointments()
        {
            // Ovdje bi išao stvarni poziv tvom internom API-ju (TerminServices)
            // npr. _terminService.GetAvailableTermsForOrthodontist();
            return new List<string> { "2025-07-01 10:00", "2025-07-01 11:30", "2025-07-02 09:00" };
        }

        /// <summary>
        /// Simulira slanje ponude pacijentu.
        /// </summary>
        private async Task ProcessSendOfferTask(string taskId, string processInstanceId, string patientName, string patientEmail, string selectedAppointment)
        {
            _logger.LogInformation($"Processing 'Pošalji ponudu pacijentu' for {patientName} ({patientEmail}) with appointment {selectedAppointment}.");
            // Ovdje bi išla stvarna logika za slanje emaila/SMS-a pacijentu s ponudom termina
            // npr. poziv EmailService.SendAppointmentOffer(patientEmail, selectedAppointment);

            // Dovršavanje zadatka. Možeš prosljeđivati nove varijable ako su potrebne.
            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                { "offerSent", new { value = true, type = "Boolean" } } // Opcionalno: varijabla koja kaže da je ponuda poslana
            });
            _logger.LogInformation($"'Pošalji ponudu pacijentu' task '{taskId}' completed.");
        }

        /// <summary>
        /// Simulira logiku za ponovni odabir termina.
        /// </summary>
        private async Task ProcessReselectAppointmentTask(string taskId, string processInstanceId, string patientName)
        {
            _logger.LogInformation($"Processing 'Ponovno predlozi termin' for {patientName}.");
            // Ovdje možeš dodati logiku koja priprema proces za ponovni odabir termina.
            // Npr. logiranje da je pacijent odbio, možda resetiranje nekih brojača pokušaja.
            _logger.LogInformation($"Patient {patientName} rejected the offer. Preparing for reselection.");

            await CompleteExternalTask(taskId, new Dictionary<string, object>
            {
                { "reselectionInitiated", new { value = true, type = "Boolean" } }
            });
            _logger.LogInformation($"'Ponovno predlozi termin' task '{taskId}' completed.");
        }


        // --- Pomoćne metode za komunikaciju s Camundom ---

        /// <summary>
        /// Dovršava External Task u Camundi.
        /// </summary>
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
                // Logiranje uspješnog dovršavanja zadatka
                _logger.LogInformation($"External Task '{taskId}' completed successfully.");
            }
            else
            {
                // Logiranje grešaka pri dovršavanju zadatka
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to complete External Task '{taskId}': {response.StatusCode} - {errorContent}");
                // Razmisli o tome što učiniti ako ne možeš dovršiti zadatak (npr. ponovni pokušaj, obavijest administratoru)
            }
        }

        /// <summary>
        /// Prijavljuje grešku za External Task u Camundi.
        /// </summary>
        private async Task ReportFailure(string taskId, string errorMessage, string errorDetails)
        {
            var payload = new
            {
                workerId = WorkerId,
                errorMessage = errorMessage,
                errorDetails = errorDetails,
                retries = 0, // Broj preostalih pokušaja za ovaj zadatak. Postavi 0 ako želiš da se odmah stavi u "failed" stanje.
                retryTimeout = 10000 // Vrijeme u ms prije sljedećeg pokušaja (ako retries > 0)
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