namespace backend.Models;

public partial class Room
{
    public int IdRoom { get; set; }

    public string Name { get; set; } = null!;

    public int TotalWorkspace { get; set; }

    public int IdFloor { get; set; }

    public int? Square { get; set; }

    public int? IdRoomStatus { get; set; }

    public virtual Floor IdFloorNavigation { get; set; } = null!;

    public virtual RoomStatus? IdRoomStatusNavigation { get; set; }

    public virtual ICollection<Workspace> Workspaces { get; set; } = new List<Workspace>();
}
