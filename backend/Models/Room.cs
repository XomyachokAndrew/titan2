using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Room
{
    public int IdRoom { get; set; }

    public string? Status { get; set; }

    public string Name { get; set; } = null!;

    public int TotalWorkspace { get; set; }

    public int IdFloor { get; set; }

    public int? Square { get; set; }

    public virtual Floor IdFloorNavigation { get; set; } = null!;

    public virtual ICollection<Workspace> Workspaces { get; set; } = new List<Workspace>();
}
