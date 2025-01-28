namespace backend.Models;

public partial class Workspace
{
    public int IdWorkspace { get; set; }

    public string Name { get; set; } = null!;

    public int IdRoom { get; set; }

    public virtual Room IdRoomNavigation { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
