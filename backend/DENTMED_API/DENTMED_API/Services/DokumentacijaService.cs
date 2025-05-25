using DENTMED_API.Contexts;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Services
{
    public class DokumentacijaService
    {
        private readonly AppDbContext _context;

        public DokumentacijaService(AppDbContext context)
        {
            _context = context;
        }

        //Generator id za dokumentaciju
        public async Task<int> GetNextIdDokumentacija()
        {
            var lastDokument = await _context.Dokumentacija
                .OrderByDescending(p => p.id_dokument)
                .FirstOrDefaultAsync();

            return lastDokument != null ? lastDokument.id_dokument + 1 : 10000;//dokumentacija krece od 10000 blok sifri
        }
    }
}
