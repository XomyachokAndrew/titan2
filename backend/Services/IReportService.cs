namespace backend.Services
{
    /// <summary>
    /// Интерфейс для сервиса отчетов по аренде офисов.
    /// </summary>
    public interface IReportService
    {
        Task<string> GenerateRentalCostReportAsync(int officeId, int reportTypeId, int idUser);
    }

}
