using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Department
{
    public int IdDepartment { get; set; }

    public string Name { get; set; } = null!;

    public string Descriptions { get; set; } = null!;

    public virtual ICollection<StatusesWorker> StatusesWorkers { get; set; } = new List<StatusesWorker>();
}
