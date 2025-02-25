namespace backend.Services
{
    public interface IReportService
    {
        Task<string> GenerateRentalCostReportAsync(int officeId, int reportTypeId, int idUser);
    }
}
