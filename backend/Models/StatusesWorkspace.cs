using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class StatusesWorkspace
{
    public int IdStatusWorkspace { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int IdWorkspace { get; set; }

    public int IdStatus { get; set; }

    public int IdWorker { get; set; }

    public int IdUser { get; set; }

    public virtual WorkspaceStatusesType IdStatusNavigation { get; set; } = null!;

    public virtual User IdUserNavigation { get; set; } = null!;

    public virtual Worker IdWorkerNavigation { get; set; } = null!;

    public virtual Workspace IdWorkspaceNavigation { get; set; } = null!;
}
