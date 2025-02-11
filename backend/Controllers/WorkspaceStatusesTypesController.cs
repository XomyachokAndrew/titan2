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
    public class WorkspacesStatusesTypesController : ControllerBase
    {
        private readonly Context _context;

        public WorkspacesStatusesTypesController(Context context)
        {
            _context = context;
        }

        // GET: api/WorkspacesStatusesTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkspacesStatusesType>>> GetWorkspacesStatusesTypes()
        {
            return await _context.WorkspacesStatusesTypes.ToListAsync();
        }

        // GET: api/WorkspacesStatusesTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkspacesStatusesType>> GetWorkspacesStatusesType(int id)
        {
            var workspacesStatusesType = await _context.WorkspacesStatusesTypes.FindAsync(id);

            if (workspacesStatusesType == null)
            {
                return NotFound();
            }

            return workspacesStatusesType;
        }

        // PUT: api/WorkspacesStatusesTypes/5
        // To protect from overposting attacks, see http://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkspacesStatusesType(int id, WorkspacesStatusesType workspacesStatusesType)
        {
            if (id != workspacesStatusesType.IdStatus)
            {
                return BadRequest();
            }

            _context.Entry(workspacesStatusesType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkspacesStatusesTypeExists(id))
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

        // POST: api/WorkspacesStatusesTypes
        // To protect from overposting attacks, see http://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<WorkspacesStatusesType>> PostWorkspacesStatusesType(WorkspacesStatusesType workspacesStatusesType)
        {
            _context.WorkspacesStatusesTypes.Add(workspacesStatusesType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWorkspacesStatusesType", new { id = workspacesStatusesType.IdStatus }, workspacesStatusesType);
        }

        // DELETE: api/WorkspacesStatusesTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkspacesStatusesType(int id)
        {
            var workspacesStatusesType = await _context.WorkspacesStatusesTypes.FindAsync(id);
            if (workspacesStatusesType == null)
            {
                return NotFound();
            }

            _context.WorkspacesStatusesTypes.Remove(workspacesStatusesType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkspacesStatusesTypeExists(int id)
        {
            return _context.WorkspacesStatusesTypes.Any(e => e.IdStatus == id);
        }
    }
}
