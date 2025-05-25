using Microsoft.EntityFrameworkCore;
using Moq;
using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;

public class PacijentServiceTests
{
    private AppDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetNextIdPacijent_ShouldReturn1000_WhenDatabaseIsEmpty()
    {
        var context = GetInMemoryContext();
        var mockTerminService = new Mock<TerminServices>(context);
        var service = new PacijentService(context, mockTerminService.Object);

        // Funkcija koju provjeravamo
        var nextId = await service.GetNextIdPacijent();

        // Usporedba rezultata
        Assert.Equal(1000, nextId);
    }

    [Fact]
    public async Task GetNextIdPacijent_ShouldReturnNextId_WhenDatabaseHasPacijents()
    {
        var context = GetInMemoryContext();

        // Dodavanje pacijenata
        context.Pacijent.Add(new Pacijent
        {
            id_pacijent = 1005,
            ime = "Marko",
            prezime = "Mariæ",
            oib = "12345678",
            datum_rod = new DateOnly(2001, 1, 1),
            spol = "M",
            adresa = "Ulica svježeg zraka",
            mjesto = "Zagreb",
            br_tel = "+385912456897",
            email = "marko.maric@gmail.com",
            id_lijecnik = 100
        });
        context.Pacijent.Add(new Pacijent
        {
            id_pacijent = 1006,
            ime = "Ana",
            prezime = "Aniæ",
            oib = "12345678",
            datum_rod = new DateOnly(2001, 3, 1),
            spol = "Ž",
            adresa = "Ulica svježeg zraka",
            mjesto = "Zagreb",
            br_tel = "+385912456897",
            email = "ana.anic@gmail.com",
            id_lijecnik = 101
        });

        await context.SaveChangesAsync();

        var mockTerminService = new Mock<TerminServices>(context);
        var service = new PacijentService(context, mockTerminService.Object);

        // Funkcija koju provjeravamo
        var nextId = await service.GetNextIdPacijent();

        // Usporedba rezultata
        Assert.Equal(1007, nextId);
    }

}
