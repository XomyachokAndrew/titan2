using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class WorkerDetail
{
    public int? IdWorker { get; set; }

    public string? FullWorkerName { get; set; }

    public string? PostName { get; set; }

    public string? DepartmentName { get; set; }
}
