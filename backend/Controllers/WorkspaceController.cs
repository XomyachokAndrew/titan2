using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkspaceController : ControllerBase
    {
        private readonly Context _context;

        public WorkspaceController(Context context)
        {
            _context = context;
        }

        // GET: api/workspaces/room/{roomId}
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<CurrentWorkspace>>> GetWorkspacesByRoom(int roomId)
        {
            var workspaces = await _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom == roomId)
                .ToListAsync();

            if (workspaces == null || !workspaces.Any())
            {
                return NotFound($"No workspaces found for room ID {roomId}.");
            }

            return Ok(workspaces);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CurrentWorkspace>> GetWorkspaceInfo(int id)
        {
            var workspaceInfo = await _context.CurrentWorkspaces
                .FirstOrDefaultAsync(cw => cw.IdWorkspace == id);

            if (workspaceInfo == null)
            {
                return NotFound();
            }

            // Получаем детали работников, связанные с рабочим пространством
            var workerDetails = await _context.WorkerDetails
                .Where(wd => wd.IdWorker == workspaceInfo.IdWorker)
                .ToListAsync();

            return Ok(workspaceInfo);
        }

        // GET: api/workspaces/{id}/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<StatusWorkspaceInfoDto>>> GetWorkspaceHistory(int id)
        {
            var history = await _context.HistoryWorkspaceStatuses
                .FromSqlRaw("SELECT * FROM offices_management.history_workspace_statuses WHERE id_workspace = {0} ORDER BY start_date", id)
                .ToListAsync();

            if (history == null || history.Count == 0)
            {
                return NotFound();
            }

            return Ok(history);
        }

        // Метод для добавления статуса рабочего места
        [HttpPost]
        public async Task<IActionResult> AddStatusWorkspace(StatusWorkspaceDto statusWorkspaceDto)
        {
            if (statusWorkspaceDto == null)
            {
                return BadRequest("Invalid data.");
            }

            // Устанавливаем текущую дату, если не указана
            statusWorkspaceDto.StartDate = statusWorkspaceDto.StartDate == default ? DateOnly.FromDateTime(DateTime.Now) : statusWorkspaceDto.StartDate;

            // Преобразуем DTO в модель
            var statusWorkspace = new StatusesWorkspace
            {
                StartDate = statusWorkspaceDto.StartDate,
                EndDate = statusWorkspaceDto.EndDate,
                IdWorkspace = statusWorkspaceDto.IdWorkspace,
                IdStatus = statusWorkspaceDto.IdStatus,
                IdWorker = statusWorkspaceDto.IdWorker,
                IdUser = statusWorkspaceDto.IdUser
            };

            _context.StatusesWorkspaces.Add(statusWorkspace);
            await _context.SaveChangesAsync();

            // Вызываем метод UpdateEndDate, передавая id и дату начала
            await UpdateEndDate(statusWorkspace.IdStatusWorkspace, statusWorkspaceDto.StartDate);

            return Ok();
        }

        [HttpPut("{id}/end-date")]
        public async Task<IActionResult> UpdateEndDate(int id, DateOnly? endDate = null)
        {
            // Находим статус рабочего места по id
            var statusWorkspace = await _context.StatusesWorkspaces.FindAsync(id);

            if (statusWorkspace == null)
            {
                return NotFound(); // Если статус рабочего места не найден, возвращаем 404
            }

            // Устанавливаем дату окончания на переданную дату или текущую дату, если дата равна null
            statusWorkspace.EndDate = endDate ?? DateOnly.FromDateTime(DateTime.Now);

            // Сохраняем изменения в базе данных
            await _context.SaveChangesAsync();

            return NoContent(); // Возвращаем 204 No Content, если все прошло успешно
        }

        [HttpPut("{id}")]
        public IActionResult UpdateStatus(int id, [FromBody] StatusWorkspaceUpdateDto updatedStatusDto)
        {
            if (updatedStatusDto == null)
            {
                return BadRequest("Updated status data is required.");
            }

            var currentStatus = _context.StatusesWorkspaces
                .FirstOrDefault(s => s.IdStatusWorkspace == id);

            if (currentStatus == null)
            {
                return NotFound();
            }

            // Проверка на изменение дат
            if (currentStatus.StartDate != updatedStatusDto.StartDate)
            {
                // Обновление предыдущей записи, если она существует
                var previousStatus = _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && (s.EndDate == null || s.EndDate == currentStatus.StartDate))
                    .FirstOrDefault(s => s.StartDate < updatedStatusDto.StartDate);

                if (previousStatus != null)
                {
                    previousStatus.EndDate = updatedStatusDto.StartDate; // Устанавливаем конец предыдущей записи
                }
            }
            if (currentStatus.EndDate != updatedStatusDto.EndDate)
            {                
                // Обновление следующей записи, если она существует
                var nextStatus = _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && s.StartDate == currentStatus.EndDate)
                    .FirstOrDefault(s => s.StartDate > updatedStatusDto.StartDate);

                if (nextStatus != null)
                {
                    nextStatus.StartDate = updatedStatusDto.EndDate.HasValue ? updatedStatusDto.EndDate.Value : nextStatus.StartDate;
                }
            }

            // Обновление текущего статуса, если значения не null
            currentStatus.StartDate = updatedStatusDto.StartDate;

            // Сохраняем предыдущие значения, если новые значения не указаны
            currentStatus.EndDate = updatedStatusDto.EndDate ?? currentStatus.EndDate;
            currentStatus.IdStatus = updatedStatusDto.IdStatus ?? currentStatus.IdStatus;
            currentStatus.IdWorker = updatedStatusDto.IdWorker ?? currentStatus.IdWorker;

            _context.SaveChanges();

            return NoContent();
        }
    }

    public class StatusWorkspaceDto
    {
        public int IdStatusWorkspace { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int IdWorkspace { get; set; }
        public int? IdStatus { get; set; }
        public int? IdWorker { get; set; }
        public int IdUser { get; set; }
    }

    public class StatusWorkspaceUpdateDto
    {
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? IdStatus { get; set; }
        public int? IdWorker { get; set; }
        public int? IdUser { get; set; }
    }

    public class StatusWorkspaceInfoDto
    {
        public int IdWorkspace { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? StatusType { get; set; }
        public string? WorkerFullName { get; set; }
        public string UserName { get; set; }
    }

    public class WorkspaceInfoDto
    {
        public string? WorkspaceName { get; set; }
        public string? StatusName { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public dynamic? WorkerDetails { get; set; }
    }
}