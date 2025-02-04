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
    public class WorkersStatusesTypesController : ControllerBase
    {
        private readonly Context _context;

        public WorkersStatusesTypesController(Context context)
        {
            _context = context;
        }

        // GET: api/WorkersStatusesTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkersStatusesType>>> GetWorkersStatusesTypes()
        {
            return await _context.WorkersStatusesTypes.ToListAsync();
        }

        // GET: api/WorkersStatusesTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkersStatusesType>> GetWorkersStatusesType(int id)
        {
            var workersStatusesType = await _context.WorkersStatusesTypes.FindAsync(id);

            if (workersStatusesType == null)
            {
                return NotFound();
            }

            return workersStatusesType;
        }

        // PUT: api/WorkersStatusesTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkersStatusesType(int id, WorkersStatusesType workersStatusesType)
        {
            if (id != workersStatusesType.IdStatus)
            {
                return BadRequest();
            }

            _context.Entry(workersStatusesType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkersStatusesTypeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/WorkersStatusesTypes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<WorkersStatusesType>> PostWorkersStatusesType(WorkersStatusesType workersStatusesType)
        {
            _context.WorkersStatusesTypes.Add(workersStatusesType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWorkersStatusesType", new { id = workersStatusesType.IdStatus }, workersStatusesType);
        }

        // DELETE: api/WorkersStatusesTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkersStatusesType(int id)
        {
            var workersStatusesType = await _context.WorkersStatusesTypes.FindAsync(id);
            if (workersStatusesType == null)
            {
                return NotFound();
            }

            _context.WorkersStatusesTypes.Remove(workersStatusesType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkersStatusesTypeExists(int id)
        {
            return _context.WorkersStatusesTypes.Any(e => e.IdStatus == id);
        }
    }
}
