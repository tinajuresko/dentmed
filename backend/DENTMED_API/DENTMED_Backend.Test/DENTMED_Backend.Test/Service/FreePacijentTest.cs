
using Microsoft.EntityFrameworkCore;
using Moq;
using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;

public class FreePacijentTest
{
    private AppDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetFreePacijent_ShouldReturnAllPacijents_WhenNoConflicts()
    {
        
        var context = GetInMemoryContext();
        var mockTerminService = new Mock<TerminServices>(context);
        var service = new PacijentService(context, mockTerminService.Object);

        // Dodavanje pacijenata
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

        context.Pacijent.AddRange(pacijent1, pacijent2);
        await context.SaveChangesAsync();

        // Funkcija koju provjeravamo
        var slobodniPacijenti = await service.GetFreePacijent(DateTime.Now, 30);

        // Usporedba rezultata
        Assert.Equal(2, slobodniPacijenti.Count); // Svi pacijenti sus slobodni
    }

    [Fact]
    public async Task GetFreePacijent_ShouldReturnOnlyFreePacijents_WhenSomeAreBooked()
    {
        
        var context = GetInMemoryContext();
        var mockTerminService = new Mock<TerminServices>(context); 
        var service = new PacijentService(context, mockTerminService.Object);

        // Postavljanje pacijenata
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

        context.Pacijent.AddRange(pacijent1, pacijent2);

        // Namjerno postavljanje termina pacijenata s konfliktom
        var termin = new Termin
        {
            id_pacijent = 1005,
            pocetak = DateTime.Now,
            kraj = DateTime.Now.AddMinutes(30)
        };
        context.Termin.Add(termin);

        await context.SaveChangesAsync();

        // Funkcija koju provjeravamo
        var slobodniPacijenti = await service.GetFreePacijent(DateTime.Now, 30);

        // Usporedba rezultata
        Assert.Single(slobodniPacijenti); // Samo je Ana slobodna
        Assert.Contains(slobodniPacijenti, p => p.id_pacijent == 1006);
    }
}
