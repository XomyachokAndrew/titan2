using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Worker
{
    public int IdWorker { get; set; }

    public string Name { get; set; } = null!;

    public string Surname { get; set; } = null!;

    public string? Patronymic { get; set; }

    public bool IsDeleted { get; set; }

    public virtual ICollection<StatusesWorker> StatusesWorkers { get; set; } = new List<StatusesWorker>();

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
