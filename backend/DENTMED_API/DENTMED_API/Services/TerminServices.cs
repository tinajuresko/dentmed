using DENTMED_API.Contexts;
using DENTMED_API.Models.DTO;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

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

            TimeSpan trajanje_60 = TimeSpan.FromMinutes(60);
            TimeSpan trajanje_30 = TimeSpan.FromMinutes(30);

            var prostori = await _context.Prostor.ToListAsync();


            var zauzeti_termini = await _context.Termin
                .Where(t => DateOnly.FromDateTime(t.pocetak) == datum)
                .ToListAsync();

            TimeOnly trenutno = pocetak;
            int br = 1;
            while (trenutno < kraj)
            {
                for (int i = 0; i < prostori.Count; i++)
                {
                    if (!zauzeti_termini.Any(ter => (ter.pocetak.TimeOfDay == trenutno.ToTimeSpan() || ter.pocetak.TimeOfDay ==trenutno.Add(trajanje_30).ToTimeSpan() || ter.pocetak.TimeOfDay == trenutno.Add(trajanje_60).ToTimeSpan()) && ter.id_prostor == prostori[i].id_prostor) )
                    {
                        slobodni_termini.Add(new FreeTermin { id_termin=br, pocetak = datum.ToDateTime(trenutno), kraj = datum.ToDateTime(trenutno.Add(trajanje)), id_prostor = prostori[i].id_prostor });
                    }
                    br++;
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

        public DateTime GetKraj(int trajanje, DateTime pocetak)
        {
            TimeSpan tr = TimeSpan.FromMinutes(trajanje);

            DateTime kraj;
            kraj = pocetak.Add(tr);

            return kraj;
        }

        public bool isInsideTrajanje(int trajanje, DateTime pocetak, DateTime kraj)
        {
            TimeSpan tra= TimeSpan.FromMinutes(trajanje);

            if(kraj - pocetak == tra)
            {
                return true;
            }
            return false;
        }
    }
}
