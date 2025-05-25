using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Services
{
    public class PacijentService
    {
        private readonly AppDbContext _context;
        private readonly TerminServices _terminService;

        public PacijentService(AppDbContext context, TerminServices termincontext)
        {
            _context = context;
            _terminService = termincontext;
        }

        //Generator id pacijenta
        public async Task<int> GetNextIdPacijent()
        {
            var lastPacijent = await _context.Pacijent
                .OrderByDescending(p => p.id_pacijent)
                .FirstOrDefaultAsync();

            return lastPacijent != null ? lastPacijent.id_pacijent + 1 : 1000; ////pacijenti krecu od 1000 blok sifri
        }

        ////Pronadi slobodne pacijente za termine (razrjesavanje konflikata)
        public async Task<List<Pacijent>> GetFreePacijent(DateTime pocetak, int trajanje)
        {

            List<Pacijent> pacijenti = await _context.Pacijent.ToListAsync();

            var zauzeti_termini = await _context.Termin.ToListAsync();

            DateTime kraj = _terminService.GetKraj(trajanje, pocetak);

            List<Pacijent> slobodni_pacijent = new List<Pacijent>();


            for (int i = 0; i < pacijenti.Count; i++)
            {
                if (!zauzeti_termini.Any(ter => ter.id_pacijent == pacijenti[i].id_pacijent && ((ter.pocetak <= pocetak && pocetak < ter.kraj) || (ter.pocetak < kraj && kraj <= ter.kraj))))
                {
                    slobodni_pacijent.Add(pacijenti[i]);
                }
            }

            return slobodni_pacijent;

        }
    }
}
