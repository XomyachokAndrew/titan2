using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkersController : ControllerBase
    {
        private readonly Context _context;

        public WorkersController(Context context)
        {
            _context = context;
        }

        // GET: api/Workers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkerDetail>>> GetWorkers()
        {
            return await _context.WorkerDetails.ToListAsync();
        }

        // GET: api/Workers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkerDetail>> GetWorker(int id)
        {
            var workerDetail = await _context.WorkerDetails
                .SingleOrDefaultAsync(w => w.IdWorker == id); // Выполняем запрос и получаем единственный объект

            if (workerDetail == null)
            {
                return NotFound(); // Возвращаем 404, если рабочий не найден
            }

            return Ok(workerDetail); // Возвращаем 200 и детали рабочего
        }

        // Метод для обновления данных работника
        [HttpPut("UpdateWorker/{id}")]
        public async Task<IActionResult> UpdateWorker(int id, [FromBody] WorkerDto workerDto)
        {
            // Проверка на валидность входных данных
            if (workerDto == null)
            {
                return BadRequest("Данные работника обязательны.");
            }

            // Поиск работника по ID
            var worker = await _context.Workers.FindAsync(id);
            if (worker == null)
            {
                return NotFound(); // Возврат 404, если работник не найден
            }

            // Обновление данных работника, если значения не null
            if (!string.IsNullOrEmpty(workerDto.Name))
            {
                worker.Name = workerDto.Name; // Обновляем имя, если оно не null или пустое
            }

            if (!string.IsNullOrEmpty(workerDto.Surname))
            {
                worker.Surname = workerDto.Surname; // Обновляем фамилию, если она не null или пустая
            }

            // Обновление отчества, если оно передано (может быть null)
            worker.Patronymic = workerDto.Patronymic; // Устанавливаем значение, даже если оно null

            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return NoContent(); // Возврат 204 No Content
        }

        // Метод для добавления статуса рабочего
        [HttpPost("status/add")]
        public async Task<IActionResult> AddStatusWorker(StatusWorkerDto statusWorkerDto)
        {
            // Проверка на валидность входных данных
            if (statusWorkerDto == null)
            {
                return BadRequest("Недопустимые данные.");
            }

            // Проверка на корректность дат
            if (statusWorkerDto.EndDate <= statusWorkerDto.StartDate)
            {
                return BadRequest("End date must be greater than start date.");
            }

            if (statusWorkerDto.IdPost != null && statusWorkerDto.IdDepartment != null)
            {

            }

            // Создание нового статуса рабочего
            var statusWorker = new StatusesWorker
            {
                StartDate = statusWorkerDto.StartDate ?? DateOnly.FromDateTime(DateTime.Now),
                EndDate = statusWorkerDto.EndDate,
                IdPost = statusWorkerDto.IdPost,
                IdDepartment = statusWorkerDto.IdDepartment,
                IdWorker = statusWorkerDto.IdWorker,
                IdUser = statusWorkerDto.IdUser,
                IdStatus = statusWorkerDto.IdStatus // Добавляем статус
            };

            _context.StatusesWorkers.Add(statusWorker); // Добавление статуса в контекст
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            // Проверка на существование статуса рабочего
            var status = await _context.StatusesWorkers.FindAsync(statusWorkerDto.IdStatusWorker);
            if (status != null)
            {
                // Обновление даты окончания предыдущего статуса
                await UpdateEndDate(statusWorkerDto.IdStatusWorker, statusWorker.StartDate);
            }

            return Ok(); // Возврат успешного ответа
        }

        // Метод для обновления даты окончания статуса рабочего
        [HttpPut("update-end-date/{id}")]
        public async Task<IActionResult> UpdateEndDate(int id, DateOnly? endDate = null)
        {
            // Поиск статуса рабочего по ID
            var statusWorker = await _context.StatusesWorkers.FindAsync(id);
            if (statusWorker == null)
            {
                return NotFound(); // Возврат 404, если статус не найден
            }

            // Обновление даты окончания статуса, если она не указана, устанавливается текущая дата
            statusWorker.EndDate = endDate ?? DateOnly.FromDateTime(DateTime.Now);
            await _context.SaveChangesAsync(); // Сохранение изменений в базе данных

            return NoContent(); // Возврат 204 No Content
        }

        // Метод для обновления статуса рабочего
        [HttpPut("status/update/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusWorkerDto updatedStatusDto)
        {
            // Проверка на валидность входных данных
            if (updatedStatusDto == null)
            {
                return BadRequest("Данные обновленного статуса обязательны.");
            }

            // Поиск текущего статуса по ID
            var currentStatus = await _context.StatusesWorkers.FindAsync(id);
            if (currentStatus == null)
            {
                return NotFound();
            }

            // Проверка на корректность дат
            if (updatedStatusDto.EndDate <= updatedStatusDto.StartDate)
            {
                return BadRequest("End date must be greater than start date.");
            }

            // Обновление даты окончания предыдущего статуса, если дата начала нового статуса отличается
            if (updatedStatusDto.StartDate != null && currentStatus.StartDate != updatedStatusDto.StartDate)
            {
                var previousStatus = await _context.StatusesWorkers
                    .Where(s => s.IdWorker == currentStatus.IdWorker && (s.EndDate == null || s.EndDate == currentStatus.StartDate))
                    .FirstOrDefaultAsync(s => s.StartDate < currentStatus.StartDate);

                if (previousStatus != null)
                {
                    previousStatus.EndDate = updatedStatusDto.StartDate; // Обновление даты окончания предыдущего статуса
                }
            }

            // Обновление даты начала следующего статуса, если дата окончания текущего статуса отличается
            if (updatedStatusDto.EndDate != null && currentStatus.EndDate != updatedStatusDto.EndDate)
            {
                var nextStatus = await _context.StatusesWorkers
                    .Where(s => s.IdWorker == currentStatus.IdWorker && s.StartDate > currentStatus.StartDate)
                    .FirstOrDefaultAsync();

                if (nextStatus != null)
                {
                    nextStatus.StartDate = updatedStatusDto.EndDate.Value; // Обновление даты начала следующего статуса
                }
            }

            // Обновление текущего статуса новыми значениями или оставление существующих
            currentStatus.StartDate = updatedStatusDto.StartDate ?? currentStatus.StartDate;
            currentStatus.EndDate = updatedStatusDto.EndDate ?? currentStatus.EndDate;
            currentStatus.IdPost = updatedStatusDto.IdPost;
            currentStatus.IdDepartment = updatedStatusDto.IdDepartment;
            currentStatus.IdUser = updatedStatusDto.IdUser;
            currentStatus.IdStatus = updatedStatusDto.IdStatus ?? currentStatus.IdStatus;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Метод для добавления рабочего
        [HttpPost("add")]
        public async Task<IActionResult> AddWorker([FromBody] WorkerDto workerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Создаем новый объект Worker из DTO
            var worker = new Worker
            {
                Name = workerDto.Name,
                Surname = workerDto.Surname,
                Patronymic = workerDto.Patronymic,
            };

            await _context.Workers.AddAsync(worker);
            await _context.SaveChangesAsync();

            return Ok(); // Возврат успешного ответа
        }

        // DELETE: api/Workers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorker(int id)
        {
            var worker = await _context.Workers.FindAsync(id);
            if (worker == null)
            {
                return NotFound();
            }

            // Устанавливаем статус IsDeleted на true   
            worker.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkerExists(int id)
        {
            return _context.Workers.Any(e => e.IdWorker == id);
        }

        public class StatusWorkerDto
        {
            public int IdStatusWorker { get; set; }
            public int IdWorker { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public int IdPost { get; set; }
            public int IdDepartment { get; set; }
            public int IdUser { get; set; }
            public int? IdStatus { get; set; }
        }

        public class WorkerDto
        {
            public string Name { get; set; }
            public string Surname { get; set; }
            public string? Patronymic { get; set; }
        }
    }
}
