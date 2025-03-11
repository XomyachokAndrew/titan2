using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkspaceStatusesTypesController : ControllerBase
    {
        private readonly Context _context;

        public WorkspaceStatusesTypesController(Context context)
        {
            _context = context;
        }

        // GET: api/WorkspaceStatusesTypes
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkspaceStatusesType>>> GetWorkspaceStatusesTypes()
        {
            return await _context.WorkspaceStatusesTypes.OrderBy(wst => wst.Name).ToListAsync();
        }

        // GET: api/WorkspaceStatusesTypes/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkspaceStatusesType>> GetWorkspaceStatusesType(int id)
        {
            var workspaceStatusesType = await _context.WorkspaceStatusesTypes.FindAsync(id);

            if (workspaceStatusesType == null)
            {
                return NotFound();
            }

            return workspaceStatusesType;
        }

        // PUT: api/WorkspaceStatusesTypes/5
        // To protect from overposting attacks, see http://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkspaceStatusesType(int id, WorkspaceStatusesType workspaceStatusesType)
        {
            if (id != workspaceStatusesType.IdWorkspaceStatusType)
            {
                return BadRequest();
            }

            _context.Entry(workspaceStatusesType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkspaceStatusesTypeExists(id))
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

        // POST: api/WorkspaceStatusesTypes
        // To protect from overposting attacks, see http://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<WorkspaceStatusesType>> PostWorkspaceStatusesType(WorkspaceStatusesType workspaceStatusesType)
        {
            _context.WorkspaceStatusesTypes.Add(workspaceStatusesType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWorkspaceStatusesType", new { id = workspaceStatusesType.IdWorkspaceStatusType }, workspaceStatusesType);
        }

        // DELETE: api/WorkspaceStatusesTypes/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkspaceStatusesType(int id)
        {
            var workspaceStatusesType = await _context.WorkspaceStatusesTypes.FindAsync(id);
            if (workspaceStatusesType == null)
            {
                return NotFound();
            }

            _context.WorkspaceStatusesTypes.Remove(workspaceStatusesType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkspaceStatusesTypeExists(int id)
        {
            return _context.WorkspaceStatusesTypes.Any(e => e.IdWorkspaceStatusType == id);
        }
    }
}
