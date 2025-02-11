using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Reservation
{
    public int IdReservations { get; set; }

    public int? IdReservationStatus { get; set; }

    public int IdWorkspace { get; set; }

    public int IdUser { get; set; }

    public virtual ReservationStatuse? IdReservationStatusNavigation { get; set; }

    public virtual User IdUserNavigation { get; set; } = null!;

    public virtual Workspace IdWorkspaceNavigation { get; set; } = null!;
}
