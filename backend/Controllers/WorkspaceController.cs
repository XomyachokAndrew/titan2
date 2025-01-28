using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkspaceController : ControllerBase
    {
        private readonly Context _context;

        public WorkspaceController(Context context)
        {
            _context = context;
        }

        // GET: api/workspaces/room/{roomId}
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<CurrentWorkspace>>> GetWorkspacesByRoom(int roomId)
        {
            var workspaces = await _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom == roomId)
                .ToListAsync();

            if (workspaces == null || !workspaces.Any())
            {
                return NotFound($"No workspaces found for room ID {roomId}.");
            }

            return Ok(workspaces);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkspaceInfoDto>> GetWorkspaceInfo(int id)
        {
            var workspaceInfo = await _context.CurrentWorkspaces
                .Where(cw => cw.IdWorkspace == id)
                .Select(cw => new WorkspaceInfoDto
                {
                    WorkspaceName = cw.WorkspaceName,
                    StatusName = cw.StatusName,
                    StartDate = cw.StartDate,
                    EndDate = cw.EndDate,
                    WorkerDetails = _context.WorkerDetails
                        .Where(wd => wd.IdWorker == cw.IdWorker)
                        .Select(wd => new
                        {
                            wd.FullWorkerName,
                            wd.PostName,
                            wd.DepartmentName
                        })
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (workspaceInfo == null)
            {
                return NotFound();
            }

            return Ok(workspaceInfo);
        }

        // GET: api/workspaces/{id}/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<WorkspaceStatusDto>>> GetWorkspaceHistory(int id)
        {
            var history = await _context.HistoryWorkspaceStatuses
                .FromSqlRaw("SELECT * FROM offices_management.history_workspace_statuses WHERE id_workspace = {0} ORDER BY start_date", id)
                .ToListAsync();

            if (history == null || history.Count == 0)
            {
                return NotFound();
            }

            return Ok(history);
        }
    }

    public class WorkspaceStatusDto
    {
        public int IdWorkspace { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StatusType { get; set; }
        public string WorkerFullName { get; set; }
        public string WorkerPosition { get; set; }
        public string DepartmentName { get; set; }
        public string UserName { get; set; }
    }

    public class WorkspaceInfoDto
    {
        public string? WorkspaceName { get; set; }
        public string? StatusName { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public dynamic? WorkerDetails { get; set; }
    }
}