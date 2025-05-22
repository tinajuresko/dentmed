using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/uredaj")]
    [ApiController]
    public class UredajController : Controller
    {
        private readonly AppDbContext _context;
        public UredajController(AppDbContext context)
        {
            _context = context;
        }

        //dohvat svih uredaja
        [HttpGet]
        public async Task<ActionResult<Uredaj>> GetUredaj()
        {
            var uredaji = await _context.Uredaj.Include(p => p.Resurs).ToListAsync();


            if (uredaji == null)
            {
                return NotFound("Nisu definirani uredaji.");
            }

            return Ok(uredaji);
        }
    }
}
