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
        private readonly Context _context; // Контекст базы данных

        // Конструктор, принимающий контекст базы данных
        public WorkspaceController(Context context)
        {
            _context = context;
        }

        // Получение рабочих пространств по ID комнаты
        [HttpGet("WorkspacesByRoom/{roomId}")]
        public async Task<ActionResult<IEnumerable<CurrentWorkspace>>> GetWorkspacesByRoom(int roomId)
        {
            // Запрос рабочих пространств, связанных с указанной комнатой
            var workspaces = await _context.CurrentWorkspaces
                .Where(cw => cw.IdRoom == roomId)
                .OrderBy(cw => cw.WorkspaceName)
                .ToListAsync();

            // Проверка на наличие рабочих пространств
            if (!workspaces.Any())
            {
                return NotFound($"Рабочие пространства не найдены для ID комнаты {roomId}.");
            }

            return Ok(workspaces); // Возврат найденных рабочих пространств
        }

        // Получение информации о рабочем пространстве по ID
        [HttpGet("info/{id}")]
        public async Task<ActionResult<WorkspaceInfoDto>> GetWorkspaceInfo(int id)
        {
            // Запрос информации о рабочем пространстве
            var workspaceInfo = await _context.CurrentWorkspaces
                .FirstOrDefaultAsync(cw => cw.IdWorkspace == id);

            // Проверка на наличие рабочего пространства
            if (workspaceInfo == null)
            {
                return NotFound();
            }

            // Получение деталей работника, связанных с рабочим пространством
            var workerDetail = await _context.WorkerDetails
                .FirstOrDefaultAsync(wd => wd.IdWorker == workspaceInfo.IdWorker);

            // Создание DTO для возврата информации о рабочем пространстве
            var workspaceInfoDto = new WorkspaceInfoDto
            {
                WorkspaceName = workspaceInfo.WorkspaceName,

                StatusName = workerDetail?.StatusName, // Получаем статус работника
                ReservationStatuseName = workspaceInfo.ReservationStatuseName, // Получаем статус бронирования

                StartDate = workspaceInfo.StartDate,
                EndDate = workspaceInfo.EndDate,
                WorkerDetails = new
                {
                    FullWorkerName = workerDetail?.FullWorkerName,
                    PostName = workerDetail?.PostName,
                    DepartmentName = workerDetail?.DepartmentName
                }
            };

            return Ok(workspaceInfoDto); // Возврат DTO с информацией
        }

        // Получение истории статусов рабочего пространства
        // GET: api/workspaces/{id}/history
        [HttpGet("history/{id}")]
        public async Task<ActionResult<IEnumerable<HistoryWorkspaceStatus>>> GetWorkspaceHistory(int id)
        {
            // Запрос истории статусов рабочего пространства
            var history = await _context.HistoryWorkspaceStatuses
                .FromSqlRaw("SELECT * FROM offices_management.history_workspace_statuses WHERE id_workspace = {0} ORDER BY start_date", id)
                .ToListAsync();

            // Проверка на наличие истории
            if (!history.Any())
            {
                return NotFound();
            }

            return Ok(history); // Возврат истории статусов
        }

        // Метод для добавления статуса рабочего пространства
        [HttpPost("status/add")]
        public async Task<IActionResult> AddStatusWorkspace(StatusWorkspaceDto statusWorkspaceDto)
        {
            // Проверка на валидность входных данных
            if (statusWorkspaceDto == null)
            {
                return BadRequest("Недопустимые данные.");
            }

            // Проверка на корректность дат
            if (statusWorkspaceDto.EndDate <= statusWorkspaceDto.StartDate)
            {
                return BadRequest("End date must be greater than start date.");
            }

            // Создание нового статуса рабочего пространства
            var statusWorkspace = new StatusesWorkspace
            {
                StartDate = statusWorkspaceDto.StartDate ?? DateOnly.FromDateTime(DateTime.Now),
                EndDate = statusWorkspaceDto.EndDate,
                IdWorkspace = statusWorkspaceDto.IdWorkspace,
                IdWorkspaceStatusType = statusWorkspaceDto.IdWorkspaceStatusType,
                IdWorker = statusWorkspaceDto.IdWorker,
                IdUser = statusWorkspaceDto.IdUser,
                IdWorkspaceReservationsStatuses = statusWorkspaceDto.IdWorkspacesReservationsStatuses // Добавляем статус бронирования
            };

            _context.StatusesWorkspaces.Add(statusWorkspace); // Добавление статуса в контекст
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных


            if (statusWorkspaceDto.IdStatusWorkspace != null)
            {
                // Обновление даты окончания предыдущего статуса
                await UpdateEndDate(statusWorkspaceDto.IdStatusWorkspace, statusWorkspace.StartDate);
            }

            return Ok(); // Возврат успешного ответа
        }

        // Метод для обновления даты окончания статуса рабочего пространства
        [HttpPut("update-end-date/{id}")]
        public async Task<IActionResult> UpdateEndDate(int id, DateOnly? endDate = null)
        {
            // Поиск статуса рабочего пространства по ID
            var statusWorkspace = await _context.StatusesWorkspaces.FindAsync(id);
            if (statusWorkspace == null)
            {
                return NotFound(); 
            }

            // Обновление даты окончания статуса, если она не указана, устанавливается текущая дата
            statusWorkspace.EndDate = endDate ?? DateOnly.FromDateTime(DateTime.Now);
            await _context.SaveChangesAsync(); 

            return NoContent(); 
        }

        [HttpPut("UpdateStatus/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusWorkspaceDto updatedStatusDto)
        {
            // Проверка на валидность входных данных
            if (updatedStatusDto == null)
            {
                return BadRequest("Данные обновленного статуса обязательны."); // Возврат 400 Bad Request
            }

            // Поиск текущего статуса по ID
            var currentStatus = await _context.StatusesWorkspaces.FindAsync(id);
            if (currentStatus == null)
            {
                return NotFound(); // Возврат 404, если статус не найден
            }

            // Проверка на корректность дат
            if (updatedStatusDto.EndDate <= updatedStatusDto.StartDate)
            {
                return BadRequest("End date must be greater than start date.");
            }

            // Обновление даты окончания предыдущего статуса, если дата начала нового статуса отличается
            if (updatedStatusDto.StartDate != null && currentStatus.StartDate != updatedStatusDto.StartDate)
            {
                var previousStatus = await _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && (s.EndDate == null || s.EndDate == currentStatus.StartDate))
                    .FirstOrDefaultAsync(s => s.StartDate < currentStatus.StartDate);

                if (previousStatus != null)
                {
                    previousStatus.EndDate = updatedStatusDto.StartDate; // Обновление даты окончания предыдущего статуса
                }
            }

            // Обновление даты начала следующего статуса, если дата окончания текущего статуса отличается
            if (updatedStatusDto.EndDate != null && currentStatus.EndDate != updatedStatusDto.EndDate)
            {
                var nextStatus = await _context.StatusesWorkspaces
                    .Where(s => s.IdWorkspace == currentStatus.IdWorkspace && s.StartDate > currentStatus.StartDate)
                    .FirstOrDefaultAsync();

                if (nextStatus != null)
                {
                    nextStatus.StartDate = updatedStatusDto.EndDate.Value; // Обновление даты начала следующего статуса
                }
            }

            // Обновление текущего статуса новыми значениями или оставление существующих
            currentStatus.StartDate = updatedStatusDto.StartDate ?? currentStatus.StartDate;
            currentStatus.EndDate = updatedStatusDto.EndDate ?? currentStatus.EndDate;
            currentStatus.IdWorkspaceStatusType = updatedStatusDto.IdWorkspaceStatusType ?? currentStatus.IdWorkspaceStatusType;
            currentStatus.IdWorker = updatedStatusDto.IdWorker ?? currentStatus.IdWorker;
            currentStatus.IdUser = updatedStatusDto.IdUser;
            currentStatus.IdWorkspaceReservationsStatuses = updatedStatusDto.IdWorkspacesReservationsStatuses ?? currentStatus.IdWorkspaceReservationsStatuses; // Обновляем статус бронирования

            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return NoContent(); // Возврат 204 No Content
        }

        // POST: api/workspaces/create
        [HttpPost("add")]
        public async Task<IActionResult> AddWorkspace([FromBody] WorkspaceDto workspaceDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Возвращаем 400, если модель не валидна
            }

            // Создаем новый объект Workspace из DTO
            var workspace = new Workspace
            {
                Name = workspaceDto.Name,
                IdRoom = workspaceDto.IdRoom,
                IsDeleted = false // Устанавливаем IsDeleted в false по умолчанию
            };

            await _context.Workspaces.AddAsync(workspace);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/workspaces/{id}
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteWorkspace(int id)
        {
            // Находим рабочее место по ID
            var workspace = _context.Workspaces.Find(id);
            if (workspace == null)
            {
                return NotFound(); // Возвращаем 404, если рабочее место не найдено
            }

            // Устанавливаем статус IsDeleted на true
            workspace.IsDeleted = true;

            // Сохраняем изменения в базе данных
            _context.SaveChanges();

            return NoContent(); // Возвращаем 204 No Content
        }

    }
}

