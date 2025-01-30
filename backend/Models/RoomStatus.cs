using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class RoomStatus
{
    public int IdRoomStatus { get; set; }

    public string Name { get; set; } = null!;

    public string? Descriptions { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
