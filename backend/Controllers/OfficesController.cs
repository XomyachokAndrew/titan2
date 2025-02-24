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

        [HttpGet("{id}")]
        public async Task<ActionResult<Office>> GetOfficeById(int id)
        {
            var office = await _context.Offices.FirstOrDefaultAsync(o => o.IdOffice == id);

            if (office == null)
            {
                return NotFound();
            }

            return Ok(office);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OfficeDto>>> GetOffices()
        {
            // Формируем базовый URL для изображений
            var baseImageUrl = $"{Request.Scheme}://{Request.Host}/resources/offices/";

            var offices = _context.Offices.Select(o => new OfficeDto
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
                        .Contains(w.IdRoom.Value)
                    ),
                Density = o.TotalWorkspace != 0 ? Math.Round((decimal)o.Square / (decimal)o.TotalWorkspace, 2) : 0
            }).ToList();

            return Ok(offices);
        }
    }
}
