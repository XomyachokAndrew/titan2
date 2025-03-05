namespace backend.Services
{
    /// Интерфейс для сервиса отчетов по аренде офисов.
    public interface IReportService
    {
        Task<string> GenerateRentalCostReportAsync(int officeId, int reportTypeId, int idUser);
        Task<string> GenerateOfficeReportAsync(int officeId, int reportTypeId, int idUser); // Новый метод
    }
}
