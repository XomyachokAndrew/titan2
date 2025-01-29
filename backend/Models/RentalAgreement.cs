using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class RentalAgreement
{
    public int IdRentalAgreement { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int Price { get; set; }

    public string? Document { get; set; }

    public int IdOffice { get; set; }

    public int IdUser { get; set; }

    public virtual Office IdOfficeNavigation { get; set; } = null!;

    public virtual User IdUserNavigation { get; set; } = null!;
}
