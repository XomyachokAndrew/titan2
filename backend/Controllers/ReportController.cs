using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly Context _context;

        public ReportController(Context context)
        {
            _context = context;
        }

        [HttpGet("cost/{officeId}")]
        public async Task<IActionResult> GetRentalCost(int officeId)
        {
            try
            {
                // Получаем офис по его идентификатору
                var office = await _context.Offices
                    .Include(o => o.RentalAgreements)
                    .Include(o => o.Floors)
                        .ThenInclude(f => f.Rooms)
                    .FirstOrDefaultAsync(o => o.IdOffice == officeId);

                if (office == null)
                {
                    return NotFound("Office not found.");
                }

                // Получаем идентификаторы комнат, принадлежащих офису
                var roomIds = office.Floors
                    .SelectMany(f => f.Rooms)
                    .Select(r => r.IdRoom)
                    .ToList();

                var currentWorkspaces = _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom != null && roomIds.Contains(ws.IdRoom.Value)) // Проверяем на null
                .ToList();

                // Предполагаем, что берем первую аренду для расчета
                var rentalAgreement = office.RentalAgreements.FirstOrDefault();
                if (rentalAgreement == null)
                {
                    return NotFound("No rental agreement found for this office.");
                }

                var rentalPrice = rentalAgreement.Price;
                decimal priceWorkspace = currentWorkspaces.Count() > 0 ? Math.Round( (decimal)rentalPrice / currentWorkspaces.Count(), 3) : 0;

                Console.WriteLine("\n" + priceWorkspace + "\n");

                // Подсчитываем стоимости и количество рабочих мест для каждого отдела
                var departmentCosts = currentWorkspaces
                    .Where(ws => ws.IdWorker != null)
                    .Select(ws => _context.WorkerDetails.SingleOrDefault(wd => wd.IdWorker == ws.IdWorker))
                    .Where(worker => worker != null && worker.IdDepartment != null)
                    .GroupBy(worker => worker.IdDepartment.Value)
                    .ToDictionary(
                        group => group.Key,
                        group => new DepartmentCostInfo
                        {
                            DepartmentName = group.First().DepartmentName, // Предполагается, что это поле есть в WorkerDetail
                            TotalCost = group.Count() * priceWorkspace,
                            WorkspaceCount = group.Count() // Количество рабочих мест в отделе
                        });

                // Формируем ответ
                var response = new OfficeCostInfo
                {
                    OfficeCost = rentalPrice,
                    OfficeSquare = office.Square,
                    PriceWorkspace = priceWorkspace,
                    OfficeFreeWorkspace = currentWorkspaces.Count() - departmentCosts.Sum(dc => dc.Value.WorkspaceCount), // Количество свободных рабочих мест
                    DepartmentCosts = departmentCosts.Values.ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Обработка ошибок
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        public class DepartmentCostInfo
        {
            public string DepartmentName { get; set; }
            public decimal TotalCost { get; set; }
            public int WorkspaceCount { get; set; }
        }

        public class OfficeCostInfo
        {
            public decimal OfficeCost { get; set; }
            public int? OfficeSquare { get; set; }
            public decimal? OfficeFreeWorkspace { get; set; }
            public decimal? PriceWorkspace { get; set; }
            public List<DepartmentCostInfo> DepartmentCosts { get; set; }
        }
    }
}