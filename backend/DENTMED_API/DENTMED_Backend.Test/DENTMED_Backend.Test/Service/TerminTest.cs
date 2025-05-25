using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.EntityFrameworkCore;


namespace DENTMED_Backend.Test.Service
{
    public class TerminTest
    {
        private AppDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetSlobodniTermini_ShouldReturnAvailableSlots_WhenNoConflicts()
        {
            var context = GetInMemoryContext();
            var service = new TerminServices(context);

            context.Prostor.Add(new Prostor { id_prostor = 100, dimenzija = "10x10" });
            await context.SaveChangesAsync();

            DateOnly datum = DateOnly.FromDateTime(DateTime.Today);
            TimeOnly pocetak = new TimeOnly(9, 0);
            TimeOnly kraj = new TimeOnly(12, 0);
            int trajanjeMin = 30;

            // Funkcija koju provjeravamo
            var slobodniTermini = await service.GetSlobodniTermini(datum, pocetak, kraj, trajanjeMin);

            // Usporedba rezultata
            Assert.NotEmpty(slobodniTermini);
            Assert.All(slobodniTermini, t => Assert.Equal(100, t.id_prostor));
        }

        [Fact]
        public async Task GetSlobodniTermini_ShouldNotReturnConflictingSlots_WhenTerminExists()
        {
            var context = GetInMemoryContext();
            var service = new TerminServices(context);

            context.Prostor.Add(new Prostor { id_prostor = 100, dimenzija = "10x10" });
            await context.SaveChangesAsync();

            DateOnly datum = DateOnly.FromDateTime(DateTime.Today);
            TimeOnly pocetak = new TimeOnly(9, 0);
            TimeOnly kraj = new TimeOnly(12, 0);
            int trajanjeMin = 30;

            // Za testiranje postavljamo termin koji se preklapa s odabranim terminom
            context.Termin.Add(new Termin
            {
                id_termin = 100000,
                pocetak = datum.ToDateTime(new TimeOnly(10, 0)), // Conflicts with the requested time
                kraj = datum.ToDateTime(new TimeOnly(10, 30)),
                id_prostor = 100
            });
            await context.SaveChangesAsync();

            // Funkcija koju provjeravamo
            var slobodniTermini = await service.GetSlobodniTermini(datum, pocetak, kraj, trajanjeMin);

            // Usporedba rezultata
            Assert.All(slobodniTermini, t => Assert.True(t.pocetak.TimeOfDay < new TimeSpan(10, 0, 0) || t.pocetak.TimeOfDay >= new TimeSpan(10, 30, 0)));
        }
    }
}
