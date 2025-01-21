using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Report
{
    public int IdReport { get; set; }

    public string Type { get; set; } = null!;

    public DateOnly CreateDate { get; set; }

    public string? Content { get; set; }

    public int IdUser { get; set; }

    public virtual User IdUserNavigation { get; set; } = null!;
}
