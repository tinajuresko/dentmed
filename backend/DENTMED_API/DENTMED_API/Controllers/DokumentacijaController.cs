using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/dokumentacija")]
    [ApiController]
    public class DokumentacijaController : Controller
    {
        private readonly AppDbContext _context;
        public DokumentacijaController(AppDbContext context)
        {
            _context = context;
        }

        //dohvat dokumentacije za pacijenta s id_pacijent
        [HttpGet("pacijent/{id_pacijent}")]
        public async Task<ActionResult<Pacijent>> GetDokumentacijaByPacijentId(int id_pacijent)
        {
            var dokumenti = await _context.Dokumentacija
                .Where(doc => doc.id_pacijent == id_pacijent)
                .ToListAsync();

            if (dokumenti == null || dokumenti.Count==0)
            {
                return NotFound($"Nije pronađena dokumentacija za pacijents s id_pacijenta {id_pacijent}.");
            }

            return Ok(dokumenti);
        }
    }
}
