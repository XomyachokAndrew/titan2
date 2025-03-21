﻿using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Floor
{
    public int IdFloor { get; set; }

    public short NumberFloor { get; set; }

    public int TotalWorkspace { get; set; } // Общее количество рабочих мест

    public int IdOffice { get; set; }

    public int? Square { get; set; }

    public int FreeWorkspaces { get; set; } // Свободные рабочие места

    public string Scheme { get; set; } = null!; // Название схемы этажа

    public virtual Office IdOfficeNavigation { get; set; } = null!;

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
