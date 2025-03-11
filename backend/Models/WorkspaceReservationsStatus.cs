using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class WorkspaceReservationsStatus
{
    public int IdWorkspaceReservationsStatuses { get; set; }

    public string? Name { get; set; }

    public string? Descriptions { get; set; }

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
