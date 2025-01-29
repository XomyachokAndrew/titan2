using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ReservationStatuse
{
    public int IdReservationsStatuses { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
