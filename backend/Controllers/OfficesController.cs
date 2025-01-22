using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

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
