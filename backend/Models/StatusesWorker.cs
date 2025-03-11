using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class StatusesWorker
{
    public int IdStatusWorker { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int IdPost { get; set; }

    public int IdDepartment { get; set; }

    public int IdWorker { get; set; }

    public int IdUser { get; set; }

    public int? IdStatus { get; set; }

    public virtual Department IdDepartmentNavigation { get; set; } = null!;

    public virtual Post IdPostNavigation { get; set; } = null!;

    public virtual WorkersStatusesType? IdStatusNavigation { get; set; }

    public virtual User IdUserNavigation { get; set; } = null!;

    public virtual Worker IdWorkerNavigation { get; set; } = null!;
}
