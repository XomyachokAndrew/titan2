using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Floor
{
    public int IdFloor { get; set; }

    public short NumberFloor { get; set; }

    public int TotalWorkspace { get; set; }

    public string? Scheme { get; set; }

    public int IdOffice { get; set; }

    public int? Square { get; set; }

    public virtual Office IdOfficeNavigation { get; set; } = null!;

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
