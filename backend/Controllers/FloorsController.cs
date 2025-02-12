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
        public async Task<ActionResult<string>> GetFloor(int id)
        {
            var floor = await _context.Floors
                .Include(f => f.Rooms) 
                .FirstOrDefaultAsync(f => f.IdFloor == id);

            if (floor == null)
            {
                return NotFound();
            }

            // Путь к файлу схемы в папке wwwroot
            var schemePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resources", "floor", floor.Scheme);

            // Проверяем, существует ли файл
            if (!System.IO.File.Exists(schemePath))
            {
                return NotFound("Схема не найдена.");
            }

            // Читаем содержимое файла
            var svgContent = await System.IO.File.ReadAllTextAsync(schemePath);

            // Создаем DTO и заполняем его данными
            var floorDto = new FloorDto
            {
                IdFloor = floor.IdFloor,
                NumberFloor = floor.NumberFloor,
                TotalWorkspace = floor.TotalWorkspace,
                SchemeContent = svgContent,
                IdOffice = floor.IdOffice,
                Square = floor.Square,
                Rooms = floor.Rooms.Select(r => new RoomDto
                {
                    IdRoom = r.IdRoom,
                    Name = r.Name,
                    TotalWorkspace = r.TotalWorkspace,
                    Square = r.Square
                }).ToList()
            };

            return Ok(floorDto);
        }

        public class FloorDto
        {
            public int IdFloor { get; set; }
            public short NumberFloor { get; set; }
            public int TotalWorkspace { get; set; }
            public string? SchemeContent { get; set; } // Изменено на содержимое схемы
            public int IdOffice { get; set; }
            public int? Square { get; set; }
            public ICollection<RoomDto> Rooms { get; set; } = new List<RoomDto>();
        }

        public class RoomDto
        {
            public int IdRoom { get; set; }
            public string Name { get; set; } = null!;
            public int TotalWorkspace { get; set; }
            public int? Square { get; set; }
        }
    }
}
