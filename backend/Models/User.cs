using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class User
{
    public int IdUser { get; set; }

    public string Login { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Surname { get; set; } = null!;

    public string? Patronymic { get; set; }

    public bool IsAdmin { get; set; }

    public virtual ICollection<RentalAgreement> RentalAgreements { get; set; } = new List<RentalAgreement>();

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual ICollection<StatusesWorker> StatusesWorkers { get; set; } = new List<StatusesWorker>();

    public virtual ICollection<StatusesWorkspace> StatusesWorkspaces { get; set; } = new List<StatusesWorkspace>();
}
