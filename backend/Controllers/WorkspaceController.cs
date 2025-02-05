using backend.Data;
using backend.Models;
using backend.ModelsDto;
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

            if (!workspaces.Any())
            {
                return NotFound($"No workspaces found for room ID {roomId}.");
            }

            return Ok(workspaces);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkspaceInfoDto>> GetWorkspaceInfo(int id)
        {
            var workspaceInfo = await _context.CurrentWorkspaces
                .FirstOrDefaultAsync(cw => cw.IdWorkspace == id);

            if (workspaceInfo == null)
            {
                return NotFound();
            }

            // Получаем детали работника, связанные с рабочим пространством
            var workerDetail = await _context.WorkerDetails
                .FirstOrDefaultAsync(wd => wd.IdWorker == workspaceInfo.IdWorker);

            // Создаем DTO для возврата
            var workspaceInfoDto = new WorkspaceInfoDto
            {
                WorkspaceName = workspaceInfo.WorkspaceName,
                StatusName = workerDetail?.StatusName, // Получаем статус работника
                StartDate = workspaceInfo.StartDate,
                EndDate = workspaceInfo.EndDate,
                WorkerDetails = new
                {
                    FullWorkerName = workerDetail?.FullWorkerName,
                    PostName = workerDetail?.PostName,
                    DepartmentName = workerDetail?.DepartmentName
                }
            };

            return Ok(workspaceInfoDto);
        }

        public class WorkspaceInfoDto
        {
            public string? WorkspaceName { get; set; }
            public string? StatusName { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public dynamic? WorkerDetails { get; set; } // Можно заменить на конкретный класс, если нужно
        }

        // GET: api/workspaces/{id}/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<StatusWorkspaceDto>>> GetWorkspaceHistory(int id)
        {
            var history = await _context.HistoryWorkspaceStatuses
                .FromSqlRaw("SELECT * FROM offices_management.history_workspace_statuses WHERE id_workspace = {0} ORDER BY start_date", id)
                .ToListAsync();

            if (!history.Any())
            {
                return NotFound();
            }

            return Ok(history);
        }

        // Method to add workspace status
        [HttpPost]
        public async Task<IActionResult> AddStatusWorkspace(StatusWorkspaceDto statusWorkspaceDto)
        {
            if (statusWorkspaceDto == null)
            {
                return BadRequest("Invalid data.");
            }

            var status = await _context.StatusesWorkspaces.FindAsync(statusWorkspaceDto.IdStatusWorkspace);
            if (status == null)
            {
                return NotFound("Status workspace not found.");
            }

            var statusWorkspace = new StatusesWorkspace
            {
                StartDate = statusWorkspaceDto.StartDate ?? DateOnly.FromDateTime(DateTime.Now),
                EndDate = statusWorkspaceDto.EndDate,
                IdWorkspace = status.IdWorkspace,
                IdStatus = statusWorkspaceDto.IdStatus,
                IdWorker = statusWorkspaceDto.IdWorker,
                IdUser = statusWorkspaceDto.IdUser
            };

            _context.StatusesWorkspaces.Add(statusWorkspace);
            await _context.SaveChangesAsync();

            await UpdateEndDate(statusWorkspaceDto.IdStatusWorkspace, statusWorkspace.StartDate);

            return Ok();
        }

        [HttpPut("{id}/end-date")]
        public async Task<IActionResult> UpdateEndDate(int id, DateOnly? endDate = null)
        {
            var statusWorkspace = await _context.StatusesWorkspaces.FindAsync(id);
            if (statusWorkspace == null)
            {
                return NotFound();
            }

            statusWorkspace.EndDate = endDate ?? DateOnly.FromDateTime(DateTime.Now);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusWorkspaceDto updatedStatusDto)
        {
            if (updatedStatusDto == null)
            {
                return BadRequest("Данные обновленного статуса обязательны.");
            }

            var currentStatus = await _context.StatusesWorkspaces.FindAsync(id);
            if (currentStatus == null)
            {
                return NotFound();
            }

            if (updatedStatusDto.StartDate != null && currentStatus.StartDate != updatedStatusDto.StartDate)
            {
                var previousStatus = await _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && (s.EndDate == null || s.EndDate == currentStatus.StartDate))
                    .FirstOrDefaultAsync(s => s.StartDate < currentStatus.StartDate);

                if (previousStatus != null)
                {
                    previousStatus.EndDate = updatedStatusDto.StartDate;
                }
            }

            if (updatedStatusDto.EndDate != null && currentStatus.EndDate != updatedStatusDto.EndDate)
            {
                var nextStatus = await _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && s.StartDate > currentStatus.StartDate)
                    .FirstOrDefaultAsync();

                if (nextStatus != null)
                {
                    nextStatus.StartDate = updatedStatusDto.EndDate.Value;
                }
            }

            // Обновляем текущий статус новыми значениями или оставляем существующие
            currentStatus.StartDate = updatedStatusDto.StartDate ?? currentStatus.StartDate;
            currentStatus.EndDate = updatedStatusDto.EndDate ?? currentStatus.EndDate;
            currentStatus.IdStatus = updatedStatusDto.IdStatus ?? currentStatus.IdStatus;
            currentStatus.IdWorker = updatedStatusDto.IdWorker ?? currentStatus.IdWorker;
            currentStatus.IdUser = updatedStatusDto.IdUser;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
