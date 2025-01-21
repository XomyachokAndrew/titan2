﻿using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Office
{
    public int IdOffice { get; set; }

    public string OfficeName { get; set; } = null!;

    public string Address { get; set; } = null!;

    public int TotalWorkspace { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<Floor> Floors { get; set; } = new List<Floor>();

    public virtual ICollection<RentalAgreement> RentalAgreements { get; set; } = new List<RentalAgreement>();
}
