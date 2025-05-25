using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.EntityFrameworkCore;
using Moq;


namespace DENTMED_Backend.Test.Service
{
    public class LijecniciAllTest
    {
        private AppDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetLijecnik_ShouldReturnOnlyDoctors()
        {
            
            var context = GetInMemoryContext();
            var mockTerminService = new Mock<TerminServices>(context); 
            var service = new ZaposlenikService(context, mockTerminService.Object);

            // Postavljanje mogucih uloga
            var doktor = new Uloga { id_uloga = 1, naziv = "liječnik" };
            var admin = new Uloga { id_uloga = 2, naziv = "administrator" };
            context.Uloga.AddRange(doktor, admin);

            // Postavljanje zaposlenika s razlicitim ulogama za test
            var dr1 = new Zaposlenik { id_zaposlenik = 100, ime = "Jakov", prezime = "Horvat", id_uloga = 1, spol = "M" };
            var dr2 = new Zaposlenik { id_zaposlenik = 101, ime = "Ana", prezime = "Anić", id_uloga = 1, spol = "Ž" };
            var adm = new Zaposlenik { id_zaposlenik = 300, ime = "Marko", prezime = "Marić", id_uloga = 2, spol = "M" };

            context.Zaposlenik.AddRange(dr1, dr2, adm);
            await context.SaveChangesAsync();

            // Funkcija koju provjeravamo
            var lijecnici = await service.GetLijecnik();

            // Usporedba rezultata
            Assert.Equal(2, lijecnici.Count); //samo su 2 lijecnika
            Assert.All(lijecnici, l => Assert.Equal(1, l.id_uloga)); //dodatna provjera jesu li uistinu lijecnicni id = 1
        }
    }
}
