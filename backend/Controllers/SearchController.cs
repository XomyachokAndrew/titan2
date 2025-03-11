using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly Context _context;

        public SearchController(Context context)
        {
            _context = context;
        }

        /// <summary>
        /// Поиск офисов, комнат, рабочих мест и работников по заданному запросу.
        /// </summary>
        /// <param name="query">Строка запроса для поиска.</param>
        /// <returns>Объединенные результаты поиска по офисам, комнатам, рабочим местам и работникам.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> SearchOffices(string query)
        {
            // Проверка на пустой или состоящий только из пробелов запрос
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Search query cannot be empty."); // Возврат 400 Bad Request, если запрос пустой
            }

            var lowerQuery = query.ToLower(); // Приведение запроса к нижнему регистру для нечувствительного поиска

            // Поиск офисов
            var offices = await _context.Offices
                .Where(o => o.OfficeName.ToLower().Contains(lowerQuery) ||
                            o.Address.ToLower().Contains(lowerQuery) ||
                            o.City.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск комнат
            var rooms = await _context.Rooms
                .Where(r => r.Name.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск рабочих мест
            var workspaces = await _context.CurrentWorkspaces
                .Where(w => w.WorkspaceName.ToLower().Contains(lowerQuery) ||
                            w.WorkspaceStatusTypeName.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск работников
            var workers = await _context.WorkerDetails
                .Where(w => w.FullWorkerName.ToLower().Contains(lowerQuery) ||
                            w.PostName.ToLower().Contains(lowerQuery) ||
                            w.DepartmentName.ToLower().Contains(lowerQuery) ||
                            w.StatusName.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Объединение результатов
            var results = new
            {
                Offices = offices,
                Rooms = rooms,
                Workspaces = workspaces,
                Workers = workers
            };

            return Ok(results); // Возврат объединенных результатов поиска
        }
    }
}

