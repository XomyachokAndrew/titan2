namespace backend.Models;

public partial class WorkspaceStatusesType
{
    public int IdStatus { get; set; }

    public string Name { get; set; } = null!;

    public string? Descriptions { get; set; }

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
