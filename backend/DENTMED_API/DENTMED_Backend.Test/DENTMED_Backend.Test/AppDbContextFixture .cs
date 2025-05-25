using Microsoft.EntityFrameworkCore;
using DENTMED_API.Contexts;

public class AppDbContextFixture : IDisposable
{
    public AppDbContext Context { get; private set; }

    public AppDbContextFixture()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("IntegrationTestDb")
            .Options;

        Context = new AppDbContext(options);
    }

    public void Dispose()
    {
        Context.Dispose();
    }
}
