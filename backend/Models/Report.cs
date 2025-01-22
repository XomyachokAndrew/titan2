using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Report
{
    public int IdReport { get; set; }

    public int IdReportsTypes { get; set; }

    public DateOnly CreateDate { get; set; }

    public string? Content { get; set; }

    public int IdUser { get; set; }

    public virtual ReportsType IdReportsTypesNavigation { get; set; } = null!;

    public virtual User IdUserNavigation { get; set; } = null!;
}
