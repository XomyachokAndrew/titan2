namespace backend.ModelsDto
{
    public class WorkspaceInfoDto
    {
        public string? WorkspaceName { get; set; }
        public string? StatusName { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public dynamic? WorkerDetails { get; set; }
    }
}
