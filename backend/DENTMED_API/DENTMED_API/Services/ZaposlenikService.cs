using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace DENTMED_API.Services
{
    public class ZaposlenikService
    {
        private readonly AppDbContext _context;
        private readonly TerminServices _termincontext;

        public ZaposlenikService(AppDbContext context, TerminServices termincontext)
        {
            _context = context;
            _termincontext = termincontext;
        }

        public async Task<List<Zaposlenik>> GetLijecnik()
        {
            var lijecnik_id = _context.Uloga
                .Where(ul => ul.naziv == "liječnik")
                .Select(ul => ul.id_uloga)
                .FirstOrDefault();


            var lijecnici = await _context.Zaposlenik
                .Where(zap => zap.id_uloga == lijecnik_id)
                .ToListAsync();

            return lijecnici;
        }

        //Pronadi slobodne lijecnike za termine (razrjesavanje konflikata)
        public async Task<List<Zaposlenik>> GetFreeLijecnik(DateTime pocetak, int trajanje)
        {

            List<Zaposlenik> lijecnici = await GetLijecnik();

            var zauzeti_termini = await _context.Termin.ToListAsync();

            DateTime kraj = _termincontext.GetKraj(trajanje, pocetak);

            List<Zaposlenik> slobodni_lijecnik = new List<Zaposlenik>();


            for (int i = 0; i < lijecnici.Count; i++)
            {
                if (!zauzeti_termini.Any(ter => ter.id_lijecnik == lijecnici[i].id_zaposlenik && ((ter.pocetak <= pocetak && pocetak < ter.kraj) || (ter.pocetak < kraj && kraj <= ter.kraj))))
                {
                    Debug.WriteLine("prosao sam ja");
                    slobodni_lijecnik.Add(lijecnici[i]);
                }
                Debug.WriteLine(lijecnici[i].prezime);
            }

            return slobodni_lijecnik;

        }
    }
}
