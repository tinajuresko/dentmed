using DENTMED_API.Contexts;
using DENTMED_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DENTMED_API.Controllers
{
    [Route("api/oprema")]
    [ApiController]
    public class OpremaController : Controller
    {
        private readonly AppDbContext _context;
        public OpremaController(AppDbContext context)
        {
            _context = context;
        }

        //dohvat sve opreme
        [HttpGet]
        public async Task<ActionResult<Oprema>> GetOprema()
        {
            var oprema = await _context.Oprema.Include(p => p.Resurs).ToListAsync();


            if (oprema == null)
            {
                return NotFound("Nije definirana oprema.");
            }

            return Ok(oprema);
        }
    }
}
