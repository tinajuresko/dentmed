using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/usluga")]
    [ApiController]
    public class UslugaController : Controller
    {
        private readonly AppDbContext _context;
        public UslugaController(AppDbContext context)
        {
            _context = context;
        }

        //dohvat svih usluga
        [HttpGet]
        public async Task<ActionResult<Usluga>> GetUsluga()
        {
            var usluge = await _context.Usluga.ToListAsync();


            if (usluge == null)
            {
                return NotFound("Nisu definirane usluge.");
            }

            return Ok(usluge);
        }
    }
}
