using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/termin")]
    [ApiController]
    public class TerminController : Controller
    {
        private readonly AppDbContext _context;
        private readonly TerminServices _terminservices;
        public TerminController(AppDbContext context, TerminServices terminServices)
        {
            _context = context;
            _terminservices = terminServices;
        }

        //postavljanje novog termina, odabir
        [HttpPost("{trajanje}")]
        public async Task<IActionResult> AddNewTermin(int trajanje, [FromBody] Termin newTermin)
        {
            var postojeciPacijent = await _context.Pacijent.AnyAsync(p => p.id_pacijent == newTermin.id_pacijent);

            if (!postojeciPacijent) return BadRequest("Neispravni id pacijenta.");

            if (newTermin == null)
            {
                return BadRequest("Neispravni podaci o terminu.");
            }
            newTermin.pocetak = newTermin.pocetak.ToUniversalTime();
            newTermin.id_termin = await _terminservices.GetNextIdTermin();
            newTermin.kraj = _terminservices.GetKraj(trajanje, newTermin.pocetak);


            _context.Termin.Add(newTermin);
            await _context.SaveChangesAsync();

            return Ok(newTermin);
        }

        //izmjena postojeceg termina
        [HttpPut("{id_termin}")]
        public async Task<IActionResult> UpdateTermin(int id_termin, [FromBody] Termin updatedTermin)
        {
            var odabraniTermin = await _context.Termin.FindAsync(id_termin);

            if (odabraniTermin == null)
            {
                return NotFound("Termin nije pronađen.");
            }

            // provjera pacijenta FK
            var postojeciPacijent = await _context.Pacijent.AnyAsync(p => p.id_pacijent == updatedTermin.id_pacijent);

            if (!postojeciPacijent) return BadRequest("Neispravni id pacijenta.");

            odabraniTermin.id_lijecnik = updatedTermin.id_lijecnik;
            odabraniTermin.id_pacijent = updatedTermin.id_pacijent;
            odabraniTermin.id_prostor = updatedTermin.id_prostor;
            odabraniTermin.pocetak = updatedTermin.pocetak.ToUniversalTime();
            odabraniTermin.kraj = updatedTermin.kraj.ToUniversalTime();
            odabraniTermin.id_usluga = updatedTermin.id_usluga;

            _context.Termin.Update(odabraniTermin);
            await _context.SaveChangesAsync();

            return Ok(odabraniTermin);
        }

        //vraca sve slobodne termine za zadani datum i smjenu i odredeno trajanje
        [HttpGet("slobodni/smjena/{id_smjena}/datum/{datum}/{trajanje}")]
        public async Task<ActionResult<Termin>> GetTerminBySmjenaId(int id_smjena, DateOnly datum, int trajanje)
        {

            var smjena = await _context.RadnoVrijeme.FindAsync(id_smjena);

            if (smjena == null)
            {
                return NotFound($"Nije pronađena smjena.");
            }

            TimeOnly pocetak = smjena.pocetak;
            TimeOnly kraj = smjena.kraj;

            var slobodni_termini = await _terminservices.GetSlobodniTermini(datum, pocetak, kraj, trajanje);

            if (slobodni_termini == null)
            {
                return NotFound("Ne postoje slobodni termini za postavljeni datum.");
            }


            return Ok(slobodni_termini);
        }

        //vraca samo zauzete termine za dani datum i smjenu
        [HttpGet("zauzeti/smjena/{id_smjena}/datum/{datum}/{trajanje}")]
        public async Task<ActionResult<Termin>> GetZauzetTerminBySmjenaId(int id_smjena, DateOnly datum, int trajanje)
        {
            var smjena = await _context.RadnoVrijeme.FindAsync(id_smjena);

            if (smjena == null)
            {
                return NotFound($"Nije pronađena smjena.");
            }

            TimeOnly pocetak = smjena.pocetak;
            TimeOnly kraj = smjena.kraj;
            TimeSpan tra = TimeSpan.FromMinutes(trajanje);

            var zauzeti_termini = await _context.Termin
                .Where(t => DateOnly.FromDateTime(t.pocetak) == datum && t.pocetak.TimeOfDay >= pocetak.ToTimeSpan() && (t.kraj - t.pocetak) == tra)
                .ToListAsync();

            if (zauzeti_termini == null)
            {
                return NotFound("Ne postoje zakazani termini za postavljeni datum.");
            }


            return Ok(zauzeti_termini);
        }

        //vraca sve zauzete termine u sustavu
        [HttpGet]
        public async Task<ActionResult<Termin>> GetAllTermini()
        {
            var termini = await _context.Termin.ToListAsync();

            if (termini == null)
            {
                return NotFound("Ne postoje termini.");
            }

            return Ok(termini);
        }

        //brisanje termina
        [HttpDelete("{id_termin}")]
        public async Task<IActionResult> DeleteTermin(int id_termin)
        {
            var termin = await _context.Termin.FindAsync(id_termin);
            if (termin == null)
            {
                return NotFound("Termin nije pronađen.");
            }

            _context.Termin.Remove(termin);
            await _context.SaveChangesAsync();

            return Ok($"Termin s {id_termin} uspješno obrisan.");
        }

    }
}
