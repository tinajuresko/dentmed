using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/smjena")]
    [ApiController]
    public class RadnoVrijemeController : Controller
    {
        private readonly AppDbContext _context;
        private readonly RadnoVrijemeService _radnovrijemecontext;
        public RadnoVrijemeController(AppDbContext context, RadnoVrijemeService radnoVrijemecontext)
        {
            _context = context;
            _radnovrijemecontext = radnoVrijemecontext;
        }

        //dohvat svih definiranih smjena
        [HttpGet]
        public async Task<ActionResult<RadnoVrijeme>> GetRadnoVrijeme()
        {
            var smjene = await _context.RadnoVrijeme.ToListAsync();

            if (smjene == null)
            {
                return NotFound("Nisu definirane smjene.");
            }

            return Ok(smjene);
        }

        //unos nove smjene
        [HttpPost]
        public async Task<IActionResult> AddNewSmjena([FromBody] RadnoVrijeme newSmjena)
        {
            
            if (newSmjena == null)
            {
                return BadRequest("Neispravna smjena.");
            }

            newSmjena.id_smjena = await _radnovrijemecontext.GetNextIdSmjena();

            _context.RadnoVrijeme.Add(newSmjena);
            await _context.SaveChangesAsync();

            return Ok(newSmjena);
        }

        //brisanje postojece smjene
        [HttpDelete("{id_smjena}")]
        public async Task<IActionResult> DeleteSmjena(int id_smjena)
        {
            var smjena = await _context.RadnoVrijeme.FindAsync(id_smjena);
            if (smjena == null)
            {
                return NotFound("Smjena nije pronađena.");
            }

            _context.RadnoVrijeme.Remove(smjena);
            await _context.SaveChangesAsync();

            return Ok($"Smjena s id_smjena {id_smjena} uspješno obrisana.");
        }


        //izmjena postojece smjene
        [HttpPut("{id_smjena}")]
        public async Task<IActionResult> UpdateSmjena(int id_smjena, [FromBody] RadnoVrijeme updatedSmjena)
        {

            var odabranaSmjena = await _context.RadnoVrijeme.FindAsync(id_smjena);

            if (odabranaSmjena == null)
            {
                return NotFound("Smjena nije pronađena.");
            }

            odabranaSmjena.id_smjena = updatedSmjena.id_smjena;
            odabranaSmjena.pocetak = updatedSmjena.pocetak;
            odabranaSmjena.kraj = updatedSmjena.kraj;

            _context.RadnoVrijeme.Update(odabranaSmjena);
            await _context.SaveChangesAsync();

            return Ok(odabranaSmjena);
        }

    }
}
