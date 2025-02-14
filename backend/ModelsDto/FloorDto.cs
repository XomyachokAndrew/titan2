using static backend.Controllers.FloorsController;

namespace backend.ModelsDto
{
    public class FloorDto
    {
        public int IdFloor { get; set; }
        public short NumberFloor { get; set; }
        public int TotalWorkspace { get; set; }
        public string? SchemeContent { get; set; }
        public int IdOffice { get; set; }
        public int? Square { get; set; }
        public int OccupiedWorkspaces { get; set; }
        public int ReservedWorkspaces { get; set; }
        public ICollection<RoomDto> Rooms { get; set; } = new List<RoomDto>();
    }
}
