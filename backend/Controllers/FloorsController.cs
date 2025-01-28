using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FloorsController : ControllerBase
    {
        private readonly Context _context;

        public FloorsController(Context context)
        {
            _context = context;
        }

        // GET: api/floors/office/{id}
        [HttpGet("office/{id}")]
        public async Task<ActionResult<IEnumerable<Floor>>> GetFloorsByOfficeId(int id)
        {
            var floors = await _context.Floors
                .Where(f => f.IdOffice == id)
                .ToListAsync();

            if (floors == null || !floors.Any())
            {
                return NotFound();
            }

            return Ok(floors);
        }
    }
}
