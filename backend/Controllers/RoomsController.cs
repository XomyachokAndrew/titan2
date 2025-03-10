using backend.Data;
using backend.Models;
using backend.ModelsDto;
using Microsoft.AspNetCore.Authorization;
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

        /// <summary>
        /// Получение данных всех комнат на этаже.
        /// </summary>
        /// <param name="id">ID этажа.</param>
        /// <returns>Список комнат на указанном этаже.</returns>
        [HttpGet("floor/{id}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByFloorId(int id)
        {
            // Поиск комнат по ID этажа
            var rooms = await _context.Rooms
                .Where(r => r.IdFloor == id)
                .OrderBy(r => r.Name) // Сортировка по имени комнаты
                .ToListAsync();

            // Проверка на наличие найденных комнат
            if (rooms == null || !rooms.Any())
            {
                return NotFound(); // Возврат 404, если комнаты не найдены
            }

            return Ok(rooms); // Возврат найденных комнат
        }

        /// <summary>
        /// Получение данных всех комнат.
        /// </summary>
        /// <returns>Список всех комнат.</returns>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            // Получение всех комнат, отсортированных по имени
            return await _context.Rooms.OrderBy(r => r.Name).ToListAsync();
        }

        /// <summary>
        /// Получение информации о комнате по ID.
        /// </summary>
        /// <param name="id">ID комнаты.</param>
        /// <returns>Информация о комнате.</returns>
        // GET: api/Rooms/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoom(int id)
        {
            var currentDate = DateOnly.FromDateTime(DateTime.Now); // Получение текущей даты

            // Используем проекцию для получения необходимых данных
            var roomDto = await _context.Rooms
                .Where(r => r.IdRoom == id)
                .Select(r => new RoomDto
                {
                    IdRoom = r.IdRoom,
                    Name = r.Name,
                    TotalWorkspace = r.TotalWorkspace,
                    FreeWorkspace = r.Workspaces.Count(ws => !ws.StatusesWorkspaces.Any(s =>
                        (s.StartDate <= currentDate) &&
                        (s.EndDate > currentDate || s.EndDate == null) &&
                        (s.IdWorker != null ||
                         s.IdWorkspaceStatusType != null ||
                         s.IdWorkspaceReservationsStatuses != null)))
                })
                .FirstOrDefaultAsync();

            // Проверка на наличие комнаты
            if (roomDto == null)
            {
                return NotFound(); // Возврат 404, если комната не найдена
            }

            return roomDto; // Возврат DTO с информацией о комнате
        }

        /// <summary>
        /// Обновление информации о комнате.
        /// </summary>
        /// <param name="id">ID комнаты.</param>
        /// <param name="room">Объект комнаты с обновленными данными.</param>
        /// <returns>Результат выполнения операции.</returns>
        // PUT: api/Rooms/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRoom(int id, Room room)
        {
            // Проверка на соответствие ID комнаты
            if (id != room.IdRoom)
            {
                return BadRequest(); // Возврат 400 Bad Request, если ID не совпадают
            }

            _context.Entry(room).State = EntityState.Modified; // Установка состояния объекта на измененный

            try
            {
                await _context.SaveChangesAsync(); // Сохранение изменений в базе данных
            }
            catch (DbUpdateConcurrencyException)
            {
                // Обработка исключения при обновлении
                if (!RoomExists(id))
                {
                    return NotFound(); // Возврат 404, если комната не найдена
                }
                else
                {
                    throw; // Пробрасываем исключение дальше
                }
            }

            return NoContent(); // Возврат 204 No Content
        }

        /// <summary>
        /// Создание новой комнаты.
        /// </summary>
        /// <param name="room">Объект комнаты для создания.</param>
        /// <returns>Созданная комната.</returns>
        // POST: api/Rooms
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Room>> PostRoom(Room room)
        {
            _context.Rooms.Add(room); // Добавление новой комнаты в контекст
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return CreatedAtAction("GetRoom", new { id = room.IdRoom }, room); // Возврат 201 Created с информацией о новой комнате
        }

        /// <summary>
        /// Удаление комнаты по ID.
        /// </summary>
        /// <param name="id">ID комнаты.</param>
        /// <returns>Результат выполнения операции.</returns>
        // DELETE: api/Rooms/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id); // Поиск комнаты по ID
            if (room == null)
            {
                return NotFound(); // Возврат 404, если комната не найдена
            }

            _context.Rooms.Remove(room); // Удаление комнаты из контекста
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return NoContent(); // Возврат 204 No Content
        }

        /// <summary>
        /// Проверка на существование комнаты по ID.
        /// </summary>
        /// <param name="id">ID комнаты.</param>
        /// <returns>True, если комната существует; иначе false.</returns>
        private bool RoomExists(int id)
        {
            return _context.Rooms.Any(e => e.IdRoom == id); // Возврат true, если комната существует
        }
    }
}
