namespace backend.ModelsDto
{
    public class StatusWorkspaceDto
    {
        public int IdStatusWorkspace { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? IdStatus { get; set; }
        public int? IdWorker { get; set; }
        public int IdUser { get; set; }
        public int? IdWorkspacesReservationsStatuses { get; set; }
    }
}
