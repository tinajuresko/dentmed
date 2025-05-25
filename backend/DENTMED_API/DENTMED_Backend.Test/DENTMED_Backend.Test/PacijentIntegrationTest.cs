using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;


namespace DENTMED_Backend.Test
{
    public class PacijentIntegrationTest : IClassFixture<AppDbContextFixture>
    {
        private readonly AppDbContext _context;
        private readonly PacijentService _service;
        private readonly TerminServices _terminService;

        public PacijentIntegrationTest(AppDbContextFixture fixture)
        {
            _context = fixture.Context;
            _terminService = new TerminServices(_context);
            _service = new PacijentService(_context, _terminService);
        }

        [Fact]
        public async Task GetFreePacijent_ShouldUseTerminServicesCorrectly_WhenFiltering()
        {
            
            var pocetak = DateTime.Now;
            int trajanje = 60;

            var pacijent1 = new Pacijent
            {
                id_pacijent = 1005,
                ime = "Marko",
                prezime = "Marić",
                oib = "12345678",
                datum_rod = new DateOnly(2001, 1, 1),
                spol = "M",
                adresa = "Ulica svježeg zraka",
                mjesto = "Zagreb",
                br_tel = "+385912456897",
                email = "marko.maric@gmail.com",
                id_lijecnik = 100
            };

            var pacijent2 = new Pacijent
            {
                id_pacijent = 1006,
                ime = "Ana",
                prezime = "Anić",
                oib = "12345678",
                datum_rod = new DateOnly(2001, 3, 1),
                spol = "Ž",
                adresa = "Ulica svježeg zraka",
                mjesto = "Zagreb",
                br_tel = "+385912456897",
                email = "ana.anic@gmail.com",
                id_lijecnik = 101
            };

            _context.Pacijent.AddRange(pacijent1, pacijent2);

            //Koristimo funkciju GetKraj iz TerminService
            var kraj = _terminService.GetKraj(trajanje, pocetak);
            var bookedTermin = new Termin
            {
                id_pacijent = 1005,
                pocetak = pocetak,
                kraj = kraj
            };
            _context.Termin.Add(bookedTermin);

            await _context.SaveChangesAsync();

            // Funkcija koju provjeravamo
            var slobodniPacijenti = await _service.GetFreePacijent(pocetak, trajanje);

            // Usporedba rezultata
            Assert.Single(slobodniPacijenti); // Only Ana should be free
            Assert.Contains(slobodniPacijenti, p => p.id_pacijent == 1006);
        }
    }
}
