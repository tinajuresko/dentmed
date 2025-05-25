using DENTMED_API.Contexts;
using DENTMED_API.Models;
using DENTMED_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/zaposlenik")]
    [ApiController]
    public class ZaposlenikController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ZaposlenikService _zaposlenikService;

        public ZaposlenikController(AppDbContext context, ZaposlenikService zaposlenikService, TerminServices terminService)
        {
            _context = context;
            _zaposlenikService = zaposlenikService;
        }

        //dohvat svih lijecnika
        [HttpGet("lijecnik")]
        public async Task<ActionResult<IEnumerable<Zaposlenik>>> GetZaposlenikLijecnik()
        {
            var lijecnici = await _zaposlenikService.GetLijecnik();

            return Ok(lijecnici);
        }

        //dohvat svih lijecnika bez konflikata s terminom
        [HttpGet("lijecnik/{datum}/{trajanje}")]
        public async Task<ActionResult<IEnumerable<Zaposlenik>>> GetSlobodniLijecnik(DateTime datum, int trajanje)
        {
            var lijecnici = await _zaposlenikService.GetFreeLijecnik(datum, trajanje);

            return Ok(lijecnici);
        }

        //dohvat svih zaposlenika
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Zaposlenik>>> GetZaposlenik()
        {

            var zaposlenici = await _context.Zaposlenik.OrderBy(zap => zap.ime).ToListAsync();

            if(zaposlenici.Count == 0)
            {
                return BadRequest("Nisu pronađeni zaposlenici.");
            }

            return Ok(zaposlenici);
        }

        //izmjena zaposlenika
        [HttpPut("{id_zaposlenik}")]
        public async Task<IActionResult> UpdateTermin(int id_zaposlenik, [FromBody] Zaposlenik updatedZaposlenik)
        {

            var odabraniZaposlenik = await _context.Zaposlenik.FindAsync(id_zaposlenik);

            if (odabraniZaposlenik == null)
            {
                return NotFound("Zaposlenik nije pronađen.");
            }

            odabraniZaposlenik.id_zaposlenik = id_zaposlenik;
            odabraniZaposlenik.id_uloga = updatedZaposlenik.id_uloga;
            odabraniZaposlenik.spol = updatedZaposlenik.spol;
            odabraniZaposlenik.ime = updatedZaposlenik.ime;
            odabraniZaposlenik.prezime = updatedZaposlenik.prezime;
            odabraniZaposlenik.id_radno_vrijeme = updatedZaposlenik.id_radno_vrijeme;

            _context.Zaposlenik.Update(odabraniZaposlenik);
            await _context.SaveChangesAsync();

            return Ok(odabraniZaposlenik);
        }
    }
}
