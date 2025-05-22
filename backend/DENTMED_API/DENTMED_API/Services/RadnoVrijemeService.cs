using DENTMED_API.Contexts;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Services
{
    public class RadnoVrijemeService
    {
        private readonly AppDbContext _context;

        public RadnoVrijemeService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<int> GetNextIdSmjena()
        {
            var lastSmjena = await _context.RadnoVrijeme
                .OrderByDescending(p => p.id_smjena)
                .FirstOrDefaultAsync();

            return lastSmjena != null ? lastSmjena.id_smjena + 1 : 1;
        }
    }
}
