using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.EntityFrameworkCore;


namespace DENTMED_Backend.Test.Service
{
    public class RadnoVrijemeServiceTest
    {
        private AppDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) 
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetNextIdSmjena_ShouldReturn1_WhenDatabaseIsEmpty()
        {
            
            var context = GetInMemoryContext();
            var service = new RadnoVrijemeService(context);

            // Funkcija koju provjeravamo
            var nextId = await service.GetNextIdSmjena();

            // Usporedba rezultata
            Assert.Equal(1, nextId); //nema smjena pa prvi id
        }

        [Fact]
        public async Task GetNextIdSmjena_ShouldReturn1_WhenFirstSmjenaHasHigherId()
        {
            
            var context = GetInMemoryContext();
            context.RadnoVrijeme.Add(new RadnoVrijeme { id_smjena = 2, pocetak = new TimeOnly(14, 0), kraj = new TimeOnly(20, 0) });
            await context.SaveChangesAsync();

            var service = new RadnoVrijemeService(context);

            // Funkcija koju provjeravamo
            var nextId = await service.GetNextIdSmjena();

            // Usporedba rezultata
            Assert.Equal(1, nextId);//treba dati 1 kao da krece od pocetka
        }

        [Fact]
        public async Task GetNextIdSmjena_ShouldReturnNextId_WhenDatabaseHasSmjene()
        {
            // Arrange
            var context = GetInMemoryContext();
            context.RadnoVrijeme.Add(new RadnoVrijeme { id_smjena = 1, pocetak = new TimeOnly(8, 0), kraj = new TimeOnly(16, 0) });
            context.RadnoVrijeme.Add(new RadnoVrijeme { id_smjena = 2, pocetak = new TimeOnly(14, 0), kraj = new TimeOnly(20, 0) });
            await context.SaveChangesAsync();

            var service = new RadnoVrijemeService(context);

            // Funkcija koju provjeravamo
            var nextId = await service.GetNextIdSmjena();

            // Usporedba rezultata
            Assert.Equal(3, nextId); //treba dati za jedan veci id smjene
        }
    }
}
