﻿using backend.Data;
using backend.Models;
using backend.ModelsDto;
using Microsoft.AspNetCore.Authorization;
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

        
        /// <summary>
        /// Получение данных рабочих мест по id комнаты.
        /// </summary>
        /// <param name="roomId">id комнаты.</param>
        /// <returns>Список рабочих мест, связанных с указанной комнатой.</returns>
        [Authorize]
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<CurrentWorkspace>>> GetWorkspacesByRoom(int roomId)
        {
            // Запрос рабочих мест, связанных с указанной комнатой
            var workspaces = await _context.CurrentWorkspaces
                .Where(cw => cw.IdRoom == roomId)
                .OrderBy(cw => cw.WorkspaceName)
                .ToListAsync();

            // Проверка на наличие рабочих мест
            if (!workspaces.Any())
            {
                return NotFound($"Рабочие места не найдены для id комнаты {roomId}.");
            }

            return Ok(workspaces); // Возврат найденных рабочих мест
        }

        /// <summary>
        /// Получение данных о рабочем месте по id.
        /// </summary>
        /// <param name="id">id рабочего места.</param>
        /// <returns>Информация о рабочем месте.</returns>
        [Authorize]
        [HttpGet("info/{id}")]
        public async Task<ActionResult<WorkspaceInfoDto>> GetWorkspaceInfo(int id)
        {
            // Запрос информации о рабочем месте
            var workspaceInfo = await _context.CurrentWorkspaces
                .FirstOrDefaultAsync(cw => cw.IdWorkspace == id);

            // Проверка на наличие рабочего места
            if (workspaceInfo == null)
            {
                return NotFound();
            }

            // Получение деталей работника, связанных с рабочим местом
            var workerDetail = await _context.WorkerDetails
                .FirstOrDefaultAsync(wd => wd.IdWorker == workspaceInfo.IdWorker);

            // Создание DTO для возврата информации о рабочем месте
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

        /// <summary>
        /// Получение истории статусов рабочего места.
        /// </summary>
        /// <param name="id">id рабочего места.</param>
        /// <returns>История статусов рабочего места.</returns>
        [Authorize]
        [HttpGet("history/{id}")]
        public async Task<ActionResult<IEnumerable<HistoryWorkspaceStatus>>> GetWorkspaceHistory(int id)
        {
            // Запрос истории статусов рабочего места
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

        /// <summary>
        /// Метод для добавления статуса рабочего места и обновлении даты окончания предыдущего статуса.
        /// </summary>
        /// <param name="statusWorkspaceDto">DTO с данными статуса рабочего места.</param>
        /// <returns>Результат выполнения операции.</returns>
        [Authorize(Roles = "Admin")]
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

            // Создание нового статуса рабочего места
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

            // Если id статуса рабочего места не равен null, обновляем дату окончания предыдущего статуса
            if (statusWorkspaceDto.IdStatusWorkspace != null)
            {
                await UpdateEndDate(statusWorkspaceDto.IdStatusWorkspace, statusWorkspace.StartDate);
            }

            return Ok(); // Возврат успешного ответа
        }

        /// <summary>
        /// Метод для обновления даты окончания статуса рабочего места.
        /// </summary>
        /// <param name="id">id статуса рабочего места.</param>
        /// <param name="endDate">Новая дата окончания.</param>
        /// <returns>Результат выполнения операции.</returns>
        [Authorize(Roles = "Admin")]
        [HttpPut("update-end-date/{id}")]
        public async Task<IActionResult> UpdateEndDate(int id, DateOnly? endDate = null)
        {
            // Поиск статуса рабочего места по id
            var statusWorkspace = await _context.StatusesWorkspaces.FindAsync(id);
            if (statusWorkspace == null)
            {
                return NotFound();
            }

            // Обновление даты окончания статуса, если она не указана, устанавливается текущая дата
            statusWorkspace.EndDate = endDate ?? DateOnly.FromDateTime(DateTime.Now);
            await _context.SaveChangesAsync();

            return NoContent(); // Возврат 204 No Content
        }

        /// <summary>
        /// Метод для обновления статуса рабочего места.
        /// </summary>
        /// <param name="id">id статуса рабочего места.</param>
        /// <param name="updatedStatusDto">DTO с обновленными данными статуса.</param>
        /// <returns>Результат выполнения операции.</returns>
        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateStatus/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusWorkspaceDto updatedStatusDto)
        {
            // Проверка на валидность входных данных
            if (updatedStatusDto == null)
            {
                return BadRequest("Данные обновленного статуса обязательны."); // Возврат 400 Bad Request
            }

            // Поиск текущего статуса по id
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
        
        /// <summary>
        /// Метод для добавления нового рабочего места.
        /// </summary>
        /// <param name="workspaceDto">DTO с данными рабочего места.</param>
        /// <returns>Результат выполнения операции.</returns>
        [Authorize(Roles = "Admin")]
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

            await _context.Workspaces.AddAsync(workspace); // Добавление нового рабочего места в контекст
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return Ok(); // Возврат успешного ответа
        }

        /// <summary>
        /// Метод для удаления рабочего места по id.
        /// </summary>
        /// <param name="id">id рабочего места.</param>
        /// <returns>Результат выполнения операции.</returns>
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteWorkspace(int id)
        {
            // Находим рабочее место по id
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