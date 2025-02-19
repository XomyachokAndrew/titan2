namespace backend.ModelsDto
{
    public class OfficeDto
    {
        public int IdOffice { get; set; }
        public string OfficeName { get; set; }
        public string Address { get; set; }
        public string ImageUrl { get; set; }
        public int? Square { get; set; }
        public int? TotalWorkspace { get; set; }
        public decimal? OccupiedWorkspaces { get; set; }
        public int ReservedWorkspaces { get; set; }
        public decimal? Density { get; set; }
    }
}
