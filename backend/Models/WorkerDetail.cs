using System;
using System.Collections.Generic;

namespace backend.Models;

// Представление WorkerDetail из БД с полными данными о работниках
public partial class WorkerDetail
{
    public int? IdWorker { get; set; }

    public int? IdStatusWorker { get; set; }

    public string? FullWorkerName { get; set; }

    public int? IdPost { get; set; }

    public string? PostName { get; set; }

    public int? IdDepartment { get; set; }

    public string? DepartmentName { get; set; }

    public int? IdStatus { get; set; }

    public string? StatusName { get; set; }
}
