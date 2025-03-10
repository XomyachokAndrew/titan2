using System;
using System.Collections.Generic;

namespace backend.Models;

// Типов отчётов
public partial class ReportsType
{
    public int IdReportsTypes { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
}
