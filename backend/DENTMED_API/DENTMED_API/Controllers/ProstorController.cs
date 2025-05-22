using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/prostor")]
    [ApiController]
    public class ProstorController : Controller
    {
        private readonly AppDbContext _context;
        public ProstorController(AppDbContext context)
        {
            _context = context;
        }

        //dohvat svih prostora
        [HttpGet]
        public async Task<ActionResult<Prostor>> GetProstor()
        {
            var prostori = await _context.Prostor.Include(p => p.Resurs).ToListAsync();


            if (prostori == null)
            {
                return NotFound("Nisu definirani prostori.");
            }

            return Ok(prostori);
        }
    }
}
