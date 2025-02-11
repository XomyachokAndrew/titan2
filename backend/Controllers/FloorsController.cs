using backend.Data;
using backend.Models;
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

        // GET: api/floors/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Floor>> GetFloor(int id)
        {
            var floor = await _context.Floors
                .Include(f => f.IdOfficeNavigation) // Если нужно включить информацию об офисе
                .Include(f => f.Rooms) // Если нужно включить информацию о комнатах
                .FirstOrDefaultAsync(f => f.IdFloor == id);

            if (floor == null)
            {
                return NotFound();
            }

            return floor;
        }
    }
}
