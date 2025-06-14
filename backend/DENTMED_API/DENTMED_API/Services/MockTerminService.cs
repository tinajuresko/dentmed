using DENTMED_API.Interfaces;
using DENTMED_API.Models;

namespace DENTMED_API.Services
{
    public class MockTerminService : IMockTerminService
    {
        private readonly ILogger<MockTerminService> _logger;

        public MockTerminService(ILogger<MockTerminService> logger)
        {
            _logger = logger;
        }

        public async Task<List<Termin>> GetMockTerminBySmjenaIdAsync(int smjenaId, DateOnly datum, int trajanje)
        {
            _logger.LogInformation($"Generiram mock termine za smjenu (lijecnika): {smjenaId}, datum: {datum.ToShortDateString()}, trajanje: {trajanje} minuta.");

            List<Termin> mockTermini = new List<Termin>();
            Random rand = new Random();

            DateTime baseDate = datum.ToDateTime(TimeOnly.MinValue); // Početak proslijeđenog dana

            // Osigurazi da generira termine u budućnosti za testiranje
            // Ako je proslijeđeni datum današnji i prošlo je pola dana, generiraj za sutra
            if (baseDate.Date == DateTime.Today.Date && DateTime.Now.Hour > 16) // Npr. ako je već kasno popodne
            {
                baseDate = baseDate.AddDays(1);
                _logger.LogInformation($"Generiram mock termine za SUTRA: {baseDate.ToShortDateString()} jer je danas već kasno.");
            }


            for (int i = 0; i < 5; i++) // Generiraj 5 termina
            {
                int hour = rand.Next(9, 17); // Sati od 9 do 16
                int minute = rand.Next(0, 4) * 15; // Minute u koracima od 15 minuta

                DateTime pocetakTermina = baseDate.AddHours(hour).AddMinutes(minute);
                DateTime krajTermina = pocetakTermina.AddMinutes(trajanje);

                if (pocetakTermina < krajTermina)
                {
                    mockTermini.Add(new Termin
                    {
                        id_termin = i + 1,
                        id_lijecnik = smjenaId,
                        id_pacijent = 0,
                        id_prostor = 1,
                        pocetak = pocetakTermina,
                        kraj = krajTermina,
                        id_usluga = 1
                    });
                }
            }

            // Ograniči na 3 termina i sortiraj
            var result = mockTermini.OrderBy(t => t.pocetak).Take(5).ToList();
            _logger.LogInformation($"Generirano {result.Count} mock termina.");
            return await Task.FromResult(result);
        }
    }
}