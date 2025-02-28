using backend.Data;
using backend.Models;
using backend.ModelsDto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly Context _context;

        public RoomsController(Context context)
        {
            _context = context;
        }

        // GET: api/rooms/floor/{id}
        [HttpGet("floor/{id}")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByFloorId(int id)
        {
            var rooms = await _context.Rooms
                .Where(r => r.IdFloor == id)
                .OrderBy(r => r.Name)
                .ToListAsync();

            if (rooms == null || !rooms.Any())
            {
                return NotFound();
            }

            return Ok(rooms);
        }
        
        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            return await _context.Rooms.OrderBy(r => r.Name).ToListAsync();
        }

        // GET: api/Rooms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoom(int id)
        {
            var currentDate = DateOnly.FromDateTime(DateTime.Now);

            // Используем проекцию для получения необходимых данных
            var roomDto = await _context.Rooms
                .Where(r => r.IdRoom == id)
                .Select(r => new RoomDto
                {
                    IdRoom = r.IdRoom,
                    Name = r.Name,
                    TotalWorkspace = r.TotalWorkspace,
                    Square = r.Square,
                    FreeWorkspace = r.Workspaces.Count(ws => !ws.StatusesWorkspaces.Any(s =>
                        (s.StartDate <= currentDate) &&
                        (s.EndDate > currentDate || s.EndDate == null) &&
                        (s.IdWorker != null ||
                         s.IdWorkspaceStatusType != null ||
                         s.IdWorkspaceReservationsStatuses != null)))
                })
                .FirstOrDefaultAsync();

            if (roomDto == null)
            {
                return NotFound();
            }

            return roomDto;
        }


        // PUT: api/Rooms/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRoom(int id, Room room)
        {
            if (id != room.IdRoom)
            {
                return BadRequest();
            }

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoomExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Rooms
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Room>> PostRoom(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRoom", new { id = room.IdRoom }, room);
        }

        // DELETE: api/Rooms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(e => e.IdRoom == id);
        }
    }
}
