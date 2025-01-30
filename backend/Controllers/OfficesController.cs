using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficesController : ControllerBase
    {
        private readonly Context _context;

        public OfficesController(Context context)
        {
            _context = context;
        }

        // Получение списка офисов
        [HttpGet]
        public ActionResult<IEnumerable<Office>> GetOffices()
        {
            var offices = _context.Offices.Select(o => new
            {
                o.IdOffice,
                o.OfficeName,
                o.Address,
                o.Image
            }).ToList();

            return Ok(offices);
        }
    }
}
