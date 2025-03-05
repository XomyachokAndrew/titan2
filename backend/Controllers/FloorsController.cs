using backend.Data;
using backend.Models;
using backend.ModelsDto;
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

        /// <summary>
        /// Получает список этажей по идентификатору офиса.
        /// </summary>
        /// <param name="id">Идентификатор офиса.</param>
        /// <returns>Список этажей, относящихся к указанному офису, или 404, если не найдены.</returns>
        [HttpGet("office/{id}")]
        public async Task<ActionResult<IEnumerable<Floor>>> GetFloorsByOfficeId(int id)
        {
            var floors = await _context.Floors
                .Where(f => f.IdOffice == id)
                .OrderBy(f => f.NumberFloor)
                .ToListAsync();

            if (floors == null || !floors.Any())
            {
                return NotFound();
            }

            return Ok(floors);
        }

        /// <summary>
        /// Получает информацию об этаже по идентификатору.
        /// </summary>
        /// <param name="id">Идентификатор этажа.</param>
        /// <returns>Информацию об этаже в виде DTO или 404, если этаж не найден.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<FloorDto>> GetFloor(int id)
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

            var reservedWorkspaces = _context.CurrentWorkspaces
                .Where(w => w.IdWorker == null && w.IdWorkspaceReservationsStatuses != null)
                .Count(w => floor.Rooms.Select(r => r.IdRoom).Contains(w.IdRoom.Value));

            // Создаем DTO и заполняем его данными
            var floorDto = new FloorDto
            {
                IdFloor = floor.IdFloor,
                NumberFloor = floor.NumberFloor,
                SchemeContent = svgContent,
                IdOffice = floor.IdOffice,
                Square = floor.Square,
                Rooms = floor.Rooms.Select(r => new RoomDto
                {
                    IdRoom = r.IdRoom,
                    Name = r.Name,
                    TotalWorkspace = r.TotalWorkspace,
                    Square = r.Square
                }).ToList(),
                TotalWorkspace = floor.TotalWorkspace,
                FreeWorkspaces = floor.FreeWorkspaces,
                ReservedWorkspaces = reservedWorkspaces
            };

            return Ok(floorDto);
        }
    }
}
