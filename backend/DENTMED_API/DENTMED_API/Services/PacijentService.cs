using DENTMED_API.Contexts;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Services
{
    public class PacijentService
    {
        private readonly AppDbContext _context;

        public PacijentService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<int> GetNextIdPacijent()
        {
            var lastPacijent = await _context.Pacijent
                .OrderByDescending(p => p.id_pacijent)
                .FirstOrDefaultAsync();

            return lastPacijent != null ? lastPacijent.id_pacijent + 1 : 1000; //pacijenti id od 1000
        }
    }
}
