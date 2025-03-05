using backend.Data;
using backend.Models;
using backend.ModelsDto;
using MathNet.Numerics.Statistics.Mcmc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficesController : ControllerBase
    {
        private readonly Context _context;

        public OfficesController(Context context, HttpClient httpClient)
        {
            _context = context;
        }

        /// <summary>
        /// Получает офис по идентификатору.
        /// </summary>
        /// <param name="id">Идентификатор офиса.</param>
        /// <returns>Офис с указанным идентификатором или 404, если не найден.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Office>> GetOfficeById(int id)
        {
            // Ищем офис по идентификатору
            var office = await _context.Offices.FirstOrDefaultAsync(o => o.IdOffice == id);

            // Проверяем, найден ли офис
            if (office == null)
            {
                return NotFound(); // Возвращаем 404, если офис не найден
            }

            return Ok(office); // Возвращаем офис с кодом 200
        }

        /// <summary>
        /// Получает список всех офисов.
        /// </summary>
        /// <returns>Список офисов в виде DTO.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OfficeDto>>> GetOffices()
        {
            // Формируем базовый URL для изображений
            // Используем схему и хост из запроса для создания полного URL
            var baseImageUrl = $"{Request.Scheme}://{Request.Host}/resources/offices/";

            // Получаем список офисов с проекцией в DTO
            var offices = await _context.Offices.Select(o => new OfficeDto
            {
                IdOffice = o.IdOffice,
                OfficeName = o.OfficeName,
                Address = o.Address,
                City = o.City,
                // Формируем полный URL для изображения
                ImageUrl = $"{baseImageUrl}{o.Image}",
                Square = o.Square,
                TotalWorkspace = o.TotalWorkspace,
                // Количество свободных рабочих мест
                FreeWorkspaces = o.FreeWorkspaces,
                // Количество зарезервированных рабочих мест
                ReservedWorkspaces = _context.CurrentWorkspaces
                    .Where(w => w.IdWorker == null && w.StartDate <= DateOnly.FromDateTime(DateTime.Now)
                                                   && w.EndDate >= DateOnly.FromDateTime(DateTime.Now))
                    .Count(w => o.Floors
                        .SelectMany(f => f.Rooms)
                        .Select(r => r.IdRoom)
                        .Contains(w.IdRoom.Value) // Проверяем, что идентификатор комнаты совпадает
                    ),
                // Плотность рабочих мест (количество квадратных метров на одно рабочее место)
                Density = o.TotalWorkspace != 0 ? Math.Round((decimal)o.Square / (decimal)o.TotalWorkspace, 2) : 0
            })
                .OrderBy(o => o.OfficeName) // Сортируем офисы по имени
                .ToListAsync();

            return Ok(offices); // Возвращаем список офисов с кодом 200
        }
    }
}
