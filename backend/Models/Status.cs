namespace backend.Models;

public partial class Status
{
    public int IdStatuses { get; set; }

    public string Name { get; set; } = null!;

    public string? Descriptions { get; set; }

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
