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

        //Generator id za smjene
        public async Task<int> GetNextIdSmjena()
        {
            //sort smjena
            var firstSmjena = await _context.RadnoVrijeme
                .OrderBy(p => p.id_smjena)
                .FirstOrDefaultAsync();
            var lastSmjena = await _context.RadnoVrijeme
                .OrderByDescending(p => p.id_smjena)
                .FirstOrDefaultAsync();

            if (firstSmjena != null)
            {
                if(firstSmjena.id_smjena > 1)
                {
                    return 1;
                }

            }

            return lastSmjena != null ? lastSmjena.id_smjena + 1 : 1;
        }
    }
}
