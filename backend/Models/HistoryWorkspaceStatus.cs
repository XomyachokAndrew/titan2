using System;
using System.Collections.Generic;

namespace backend.Models;

// Представление HistoryWorkspaceStatus из БД с историей статусов всех рабочих мест
public partial class HistoryWorkspaceStatus
{
    public int? IdWorkspace { get; set; }

    public DateOnly? StartDate { get; set; } 

    public DateOnly? EndDate { get; set; }

    public string? WorkerFullName { get; set; }
}
