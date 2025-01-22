using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Linq.Expressions;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly Context _context;

        public SearchController(Context context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchOffices(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Search query cannot be empty.");
            }

            var lowerQuery = query.ToLower();

            // Поиск офисов
            var offices = await _context.Offices
                .Where(o => o.OfficeName.ToLower().Contains(lowerQuery) || o.Address.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск комнат
            var rooms = await _context.Rooms
                .Where(r => r.Name.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск рабочих мест
            var workspaces = await _context.Workspaces
                .Where(w => w.Name.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Поиск работников
            var workers = await _context.WorkerDetails
                .Where(w => w.FullWorkerName.ToLower().Contains(lowerQuery) ||
                             w.PostName.ToLower().Contains(lowerQuery) ||
                             w.DepartmentName.ToLower().Contains(lowerQuery))
                .ToListAsync();

            // Объединение результатов
            var results = new
            {
                Offices = offices,
                Rooms = rooms,
                Workspaces = workspaces,
                Workers = workers
            };

            return Ok(results);
        }
    }
}

