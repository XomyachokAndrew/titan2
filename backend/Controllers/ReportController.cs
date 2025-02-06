using backend.Data;
using backend.ModelsDto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel;
using NPOI.SS.UserModel.Charts;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly Context _context;

        public ReportController(Context context)
        {
            _context = context;
        }

        [HttpGet("cost/{officeId}")]
        public async Task<IActionResult> GetRentalCost(int officeId)
        {
            try
            {
                // Получаем офис по его идентификатору
                var office = await _context.Offices
                    .Include(o => o.RentalAgreements)
                    .Include(o => o.Floors)
                        .ThenInclude(f => f.Rooms)
                    .FirstOrDefaultAsync(o => o.IdOffice == officeId);

                if (office == null)
                {
                    return NotFound("Office not found.");
                }

                // Получаем идентификаторы комнат, принадлежащих офису
                var roomIds = office.Floors
                    .SelectMany(f => f.Rooms)
                    .Select(r => r.IdRoom)
                    .ToList();

                var currentWorkspaces = _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom != null && roomIds.Contains(ws.IdRoom.Value)) // Проверяем на null
                .ToList();

                // Предполагаем, что берем первую аренду для расчета
                var rentalAgreement = office.RentalAgreements.FirstOrDefault();
                if (rentalAgreement == null)
                {
                    return NotFound("No rental agreement found for this office.");
                }

                var rentalPrice = rentalAgreement.Price;
                decimal priceWorkspace = currentWorkspaces.Count() > 0 ? Math.Round((decimal)rentalPrice / currentWorkspaces.Count(), 3) : 0;

                // Подсчитываем стоимости и количество рабочих мест для каждого отдела
                var departmentCosts = currentWorkspaces
                    .Where(ws => ws.IdWorker != null)
                    .Select(ws => _context.WorkerDetails.SingleOrDefault(wd => wd.IdWorker == ws.IdWorker))
                    .Where(worker => worker != null && worker.IdDepartment != null)
                    .GroupBy(worker => worker.IdDepartment.Value)
                    .ToDictionary(
                        group => group.Key,
                        group => new DepartmentCostInfoDto
                        {
                            DepartmentName = group.First().DepartmentName, // Предполагается, что это поле есть в WorkerDetail
                            TotalCost = group.Count() * priceWorkspace,
                            WorkspaceCount = group.Count() // Количество рабочих мест в отделе
                        });

                // Создание Excel-файла
                using (var workbook = new XSSFWorkbook())
                {
                    var sheet = workbook.CreateSheet("Отчет о стоимости офиса");

                    // Создание стилей
                    var officeInfoStyle = workbook.CreateCellStyle();
                    var headerStyle = workbook.CreateCellStyle();
                    var departmentInfoStyle = workbook.CreateCellStyle();
                    var freeInfoStyle = workbook.CreateCellStyle();

                    // Стиль для информации о офисе
                    var officeFont = workbook.CreateFont();
                    officeFont.IsBold = true;
                    officeFont.FontHeightInPoints = 12;
                    officeInfoStyle.SetFont(officeFont);
                    officeInfoStyle.FillForegroundColor = IndexedColors.Yellow.Index;
                    officeInfoStyle.FillPattern = FillPattern.SolidForeground;

                    // Стиль для заголовков
                    var headerFont = workbook.CreateFont();
                    headerFont.IsBold = true;
                    headerFont.FontHeightInPoints = 12;
                    headerStyle.SetFont(headerFont);
                    headerStyle.FillForegroundColor = IndexedColors.BrightGreen.Index;
                    headerStyle.FillPattern = FillPattern.SolidForeground;

                    // Стиль для информации по отделам (светло-зеленый)
                    var departmentFont = workbook.CreateFont();
                    departmentFont.FontHeightInPoints = 11;
                    departmentInfoStyle.SetFont(departmentFont);
                    departmentInfoStyle.FillForegroundColor = IndexedColors.LightGreen.Index; // Светло-зеленый фон
                    departmentInfoStyle.FillPattern = FillPattern.SolidForeground;

                    // Стиль для информации о свободных местах
                    var freeFont = workbook.CreateFont();
                    freeFont.IsBold = true;
                    freeFont.FontHeightInPoints = 11;
                    freeInfoStyle.SetFont(freeFont);
                    freeInfoStyle.FillForegroundColor = IndexedColors.Red.Index;
                    freeInfoStyle.FillPattern = FillPattern.SolidForeground;

                    // Добавление информации о стоимости офиса и его площади
                    var officeInfoRow = sheet.CreateRow(0);
                    officeInfoRow.CreateCell(0).SetCellValue("Аренда офиса руб/мес");
                    officeInfoRow.GetCell(0).CellStyle = officeInfoStyle; // Применение стиля
                    officeInfoRow.CreateCell(1).SetCellValue((double)rentalPrice);
                    officeInfoRow.GetCell(1).CellStyle = officeInfoStyle; // Применение стиля
                    officeInfoRow.CreateCell(2).SetCellValue("Площадь офиса");
                    officeInfoRow.GetCell(2).CellStyle = officeInfoStyle; // Применение стиля
                    officeInfoRow.CreateCell(3).SetCellValue(office.Square.HasValue ? (double)office.Square.Value : 0);
                    officeInfoRow.GetCell(3).CellStyle = officeInfoStyle; // Применение стиля

                    // Добавление пустой строки для отступа
                    sheet.CreateRow(1);

                    // Заголовки
                    var headerRow = sheet.CreateRow(2);
                    headerRow.CreateCell(0).SetCellValue("Название отдела");
                    headerRow.GetCell(0).CellStyle = headerStyle; // Применение стиля
                    headerRow.CreateCell(1).SetCellValue("Общая стоимость руб/мес");
                    headerRow.GetCell(1).CellStyle = headerStyle; // Применение стиля
                    headerRow.CreateCell(2).SetCellValue("Количество рабочих мест");
                    headerRow.GetCell(2).CellStyle = headerStyle; // Применение стиля

                    // Заполнение данными
                    int rowIndex = 3; // Начинаем с 3-й строки, так как 0 и 1 заняты
                    foreach (var departmentCost in departmentCosts.Values)
                    {
                        var row = sheet.CreateRow(rowIndex++);
                        row.CreateCell(0).SetCellValue(departmentCost.DepartmentName);
                        row.GetCell(0).CellStyle = departmentInfoStyle; // Применение стиля
                        row.CreateCell(1).SetCellValue((double)departmentCost.TotalCost);
                        row.GetCell(1).CellStyle = departmentInfoStyle; // Применение стиля
                        row.CreateCell(2).SetCellValue(departmentCost.WorkspaceCount);
                        row.GetCell(2).CellStyle = departmentInfoStyle; // Применение стиля
                    }

                    // Добавление информации о свободных рабочих местах
                    var freeWorkspacesCount = currentWorkspaces.Count() - departmentCosts.Sum(dc => dc.Value.WorkspaceCount);
                    var freeWorkspacesCost = freeWorkspacesCount * priceWorkspace;

                    var freeRow = sheet.CreateRow(rowIndex++);
                    freeRow.CreateCell(0).SetCellValue("Свободные рабочие места");
                    freeRow.GetCell(0).CellStyle = freeInfoStyle; // Применение стиля
                    freeRow.CreateCell(1).SetCellValue((double)freeWorkspacesCost);
                    freeRow.GetCell(1).CellStyle = freeInfoStyle; // Применение стиля
                    freeRow.CreateCell(2).SetCellValue(freeWorkspacesCount);
                    freeRow.GetCell(2).CellStyle = freeInfoStyle; // Применение стиля

                    // Создание графика пирога
                    IDrawing drawing = sheet.CreateDrawingPatriarch();
                    IClientAnchor anchor = drawing.CreateAnchor(0, 0, 0, 0, 0, rowIndex + 3, 10, rowIndex + 20); // Позиция графика (сдвинут вниз для заголовка)

                    IChart pieChart = drawing.CreateChart(anchor);
                    IChartLegend legend = pieChart.GetOrCreateLegend();
                    legend.Position = LegendPosition.Right; // Позиция легенды

                    // Создание данных для графика
                    IPieChartData<string, double> data = pieChart.ChartDataFactory.CreatePieChartData<string, double>();

                    // Определяем диапазоны для графика
                    int departmentDataStartRow = 3; // Начальная строка для данных отделов
                    int departmentDataEndRow = rowIndex - 1; // Конечная строка для данных отделов

                    // Добавление данных для графика
                    var series = data.AddSeries(
                        DataSources.FromStringCellRange(sheet, new CellRangeAddress(departmentDataStartRow, departmentDataEndRow, 0, 0)), // Названия отделов
                        DataSources.FromNumericCellRange(sheet, new CellRangeAddress(departmentDataStartRow, departmentDataEndRow, 1, 1)) // Общая стоимость
                    );

                    // Установка заголовка графика
                    pieChart.SetTitle("Распределение стоимости по отделам и свободным местам");

                    // Построение графика
                    pieChart.Plot(data);

                    // Возврат файла
                    using (var memoryStream = new MemoryStream())
                    {
                        workbook.Write(memoryStream);
                        var content = memoryStream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ОтчетОСтоимостьОфиса.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                // Обработка ошибок
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}