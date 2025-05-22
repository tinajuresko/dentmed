using DENTMED_API.Contexts;
using DENTMED_API.Models.DTO;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Services
{
    public class TerminServices
    {

        private readonly AppDbContext _context;

        public TerminServices(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FreeTermin>> GetSlobodniTermini(DateOnly datum, TimeOnly pocetak, TimeOnly kraj, int trajanje_min)
        {
            List<FreeTermin> slobodni_termini = new List<FreeTermin>();

            TimeSpan trajanje = TimeSpan.FromMinutes(trajanje_min);

            var prostori = await _context.Prostor.ToListAsync();


            var zauzeti_termini = await _context.Termin
                .Where(t => DateOnly.FromDateTime(t.pocetak) == datum)
                .ToListAsync();

            TimeOnly trenutno = pocetak;
            while (trenutno < kraj)
            {
                for (int i = 0; i < prostori.Count; i++)
                {
                    if (!zauzeti_termini.Any(ter => ter.pocetak.TimeOfDay == trenutno.ToTimeSpan() && ter.id_prostor == prostori[i].id_prostor) )
                    {
                        slobodni_termini.Add(new FreeTermin { pocetak = datum.ToDateTime(trenutno), kraj = datum.ToDateTime(trenutno.Add(trajanje)), id_prostor = prostori[i].id_prostor });
                    }
                }
                trenutno = trenutno.Add(trajanje);
            }

            return slobodni_termini;
        }

        public async Task<int> GetNextIdTermin()
        {
            var lastTermin = await _context.Termin
                .OrderByDescending(p => p.id_termin)
                .FirstOrDefaultAsync();

            return lastTermin != null ? lastTermin.id_termin + 1 : 100000; 
        }
    }
}
