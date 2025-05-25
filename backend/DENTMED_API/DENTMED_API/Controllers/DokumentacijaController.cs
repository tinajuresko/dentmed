using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/dokumentacija")]
    [ApiController]
    public class DokumentacijaController : Controller
    {
        private readonly AppDbContext _context;
        private readonly DokumentacijaService _dokumentcontext;
        public DokumentacijaController(AppDbContext context, DokumentacijaService dokumentcontext)
        {
            _context = context;
            _dokumentcontext = dokumentcontext;
        }

        //dohvat dokumentacije za pacijenta s id_pacijent
        [HttpGet("pacijent/{id_pacijent}")]
        public async Task<ActionResult<List<Dokumentacija>>> GetDokumentacijaByPacijentId(int id_pacijent)
        {

            var dokumenti = await _context.Dokumentacija
                .Where(doc => doc.id_pacijent == id_pacijent)
                .ToListAsync();

            if (dokumenti.Count == 0)
            {
                return NotFound(new { Message = $"Nije pronađena dokumentacija za pacijenta s ID {id_pacijent}." });
            }

            return Ok(dokumenti);
        }

        //postavljanje nove dokumentacije pacijenta
        [HttpPost]
        public async Task<IActionResult> AddNewDokument([FromBody] Dokumentacija newDokument)
        {
            var postojeciPacijent = await _context.Pacijent.AnyAsync(p => p.id_pacijent == newDokument.id_pacijent);

            if (!postojeciPacijent) return BadRequest("Neispravni id pacijenta.");

            if (newDokument == null)
            {
                return BadRequest("Neispravna dokumentacija.");
            }

            newDokument.id_dokument = await _dokumentcontext.GetNextIdDokumentacija();

            _context.Dokumentacija.Add(newDokument);
            await _context.SaveChangesAsync();

            return Ok(newDokument);
        }

    }
}
