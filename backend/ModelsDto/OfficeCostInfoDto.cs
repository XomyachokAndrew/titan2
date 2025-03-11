namespace backend.ModelsDto
{
    public class OfficeCostInfoDto
    {
        public decimal OfficeCost { get; set; }
        public int? OfficeSquare { get; set; }
        public decimal? OfficeFreeWorkspace { get; set; }
        public decimal? PriceWorkspace { get; set; }
        public List<DepartmentCostInfoDto> DepartmentCosts { get; set; }
    }
}
