using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class WorkersStatusesType
{
    public int IdStatus { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<StatusesWorker> StatusesWorkers { get; set; } = new List<StatusesWorker>();
}
