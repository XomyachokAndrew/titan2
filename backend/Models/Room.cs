using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class Room
{
    public int IdRoom { get; set; }

    public string Name { get; set; } = null!;

    public int TotalWorkspace { get; set; } // общее количество рабочих мест

    public int IdFloor { get; set; }

    public int? Square { get; set; }

    public int? IdRoomStatus { get; set; }
    [JsonIgnore]
    public virtual Floor IdFloorNavigation { get; set; } = null!;

    public virtual RoomStatus? IdRoomStatusNavigation { get; set; }

    public virtual ICollection<Workspace> Workspaces { get; set; } = new List<Workspace>();
}
