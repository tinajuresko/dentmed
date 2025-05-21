using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace DENTMED_API.Controllers
{
    [Route("api/pacijent")]
    [ApiController]
    public class PacijentController : Controller
    {
        private readonly AppDbContext _context;
        private readonly PacijentService _pacijentService;
        public PacijentController(AppDbContext context, PacijentService pacijentService)
        {
            _context = context;
            _pacijentService = pacijentService;
        }

        //Dohvat svih pacijenata i njihovih info
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pacijent>>> GetUsers()
        {
            return await _context.Pacijent.ToListAsync();
        }

        //Unos novog pacijenta u bazu podataka
        [HttpPost]
        public async Task<IActionResult> AddPacijent([FromBody] Pacijent newPacijent)
        {
            if (newPacijent == null)
            {
                return BadRequest("Neispravni podaci o pacijentu.");
            }

            newPacijent.id_pacijent = await _pacijentService.GetNextIdPacijent();

            _context.Pacijent.Add(newPacijent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPacijentById), new { id = newPacijent.id_pacijent }, newPacijent);
        }

        //Vraca pacijenta prema zadanom id_pacijent
        [HttpGet("{id}")]
        public async Task<ActionResult<Pacijent>> GetPacijentById(int id)
        {
            var pacijent = await _context.Pacijent.FindAsync(id);

            if (pacijent == null)
            {
                return NotFound("Pacijent nije pronađen.");
            }

            return Ok(pacijent);
        }

        //Brisanje pacijenta iz baze 
        [HttpDelete("{id_pacijent}")]
        public async Task<IActionResult> DeletePatient(int id_pacijent)
        {
            var pacijent = await _context.Pacijent.FindAsync(id_pacijent);
            if (pacijent == null)
            {
                return NotFound("Pacijent nije pronađen.");
            }

            _context.Pacijent.Remove(pacijent);
            await _context.SaveChangesAsync();

            return Ok($"Pacijent s id_pacijent {id_pacijent} uspješno obrisan.");
        }
    }
}
