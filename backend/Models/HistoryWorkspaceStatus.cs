using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class HistoryWorkspaceStatus
{
    public int? IdWorkspace { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? StatusType { get; set; }

    public string? WorkerFullName { get; set; }

    public string? WorkerPosition { get; set; }

    public string? DepartmentName { get; set; }

    public string? UserName { get; set; }
}
