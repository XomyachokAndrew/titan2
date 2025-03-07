using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CurrentWorkspace
{
    public int? IdWorkspace { get; set; }

    public int? IdRoom { get; set; }

    public string? WorkspaceName { get; set; }

    public int? IdWorker { get; set; }

    public string? FullWorkerName { get; set; }

    public int? IdStatusWorkspace { get; set; }

    public int? IdWorkspaceStatusType { get; set; }

    public string? WorkspaceStatusTypeName { get; set; }

    public int? IdWorkspaceReservationsStatuses { get; set; }

    public string? ReservationStatuseName { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }
}
