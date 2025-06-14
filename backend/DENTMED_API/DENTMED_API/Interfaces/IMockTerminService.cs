using DENTMED_API.Models;

namespace DENTMED_API.Interfaces
{
    public interface IMockTerminService
    {
        Task<List<Termin>> GetMockTerminBySmjenaIdAsync(int smjenaId, DateOnly datum, int trajanje);
    }
}