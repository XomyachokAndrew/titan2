namespace backend.Services
{
    /// Интерфейс для сервиса отчетов по аренде офисов.
    public interface IReportService
    {
        Task<string> GenerateRentalCostReportAsync(int officeId, int reportTypeId, int idUser); // Создание отчёта распределения аренды офиса
        Task<string> GenerateOfficeReportAsync(int officeId, int reportTypeId, int idUser); // Создание отчёта по реестру рабочих мест
    }
}
