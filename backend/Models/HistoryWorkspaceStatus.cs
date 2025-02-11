using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class HistoryWorkspaceStatus
{
    public int? IdWorkspace { get; set; }

    public int? IdStatusWorkspace { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? IdWorkspaceStatusType { get; set; }

    public string? WorkspaceStatusTypeName { get; set; }

    public int? IdWorkspaceReservationsStatuses { get; set; }

    public string? WorkspaceReservationStatuseName { get; set; }

    public string? WorkerFullName { get; set; }

    public string? UserName { get; set; }
}
