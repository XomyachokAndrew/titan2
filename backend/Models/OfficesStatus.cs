namespace backend.Models;

public partial class OfficesStatus
{
    public int IdOfficeStatus { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Office> Offices { get; set; } = new List<Office>();
}
