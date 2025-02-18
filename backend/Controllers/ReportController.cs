using backend.Data;
using backend.ModelsDto;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.IO;
using NPOI.SS.UserModel.Charts;
using NPOI.SS.Util;
using System.Text.RegularExpressions;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly Context _context;

        // Конструктор контроллера, принимающий контекст базы данных
        public ReportController(Context context)
        {
            _context = context;
        }

        // Эндпоинт для получения стоимости аренды
        [HttpGet("{reportTypeId}/{officeId}")]
        public async Task<IActionResult> GetRentalCost(int officeId, int reportTypeId, int idUser)
        {
            try
            {
                // Получаем офис по его идентификатору
                var office = await GetOfficeWithDetails(officeId);
                if (office == null)
                {
                    return NotFound("Офис не найден.");
                }

                // Получаем идентификаторы комнат, принадлежащих офису
                var roomIds = GetRoomIds(office);

                // Получаем текущие рабочие места
                var currentWorkspaces = GetCurrentWorkspaces(roomIds);

                // Получаем первый договор аренды
                var rentalAgreement = office.RentalAgreements.FirstOrDefault();
                if (rentalAgreement == null)
                {
                    return NotFound("Нет договора аренды для этого офиса.");
                }

                // Рассчитываем стоимость рабочего места
                decimal priceWorkspace = CalculateWorkspacePrice(rentalAgreement.Price, currentWorkspaces.Count());

                // Подсчитываем стоимости и количество рабочих мест для каждого отдела
                var departmentCosts = CalculateDepartmentCosts(currentWorkspaces, priceWorkspace);

                // Создаем Excel-файл
                var filePath = CreateExcelReport(office, rentalAgreement.Price, departmentCosts, currentWorkspaces.Count(), priceWorkspace);

                // Сохраняем информацию о отчете в БД
                await SaveReportToDatabase(reportTypeId, idUser, filePath);

                // Отправляем файл пользователю для скачивания
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                // Обработка ошибок
                return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
            }
        }

        // Получение офиса с деталями
        private async Task<Office> GetOfficeWithDetails(int officeId)
        {
            return await _context.Offices
                .Include(o => o.RentalAgreements)
                .Include(o => o.Floors)
                    .ThenInclude(f => f.Rooms)
                .FirstOrDefaultAsync(o => o.IdOffice == officeId);
        }

        // Получение идентификаторов комнат
        private List<int> GetRoomIds(Office office)
        {
            return office.Floors
                .SelectMany(f => f.Rooms)
                .Select(r => r.IdRoom)
                .ToList();
        }

        // Получение текущих рабочих мест
        private List<CurrentWorkspace> GetCurrentWorkspaces(List<int> roomIds)
        {
            return _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom != null && roomIds.Contains(ws.IdRoom.Value))
                .ToList();
        }

        // Расчет стоимости рабочего места
        private decimal CalculateWorkspacePrice(decimal rentalPrice, int workspaceCount)
        {
            return workspaceCount > 0 ? Math.Round(rentalPrice / workspaceCount, 3) : 0;
        }

        // Подсчет стоимости и количества рабочих мест для каждого отдела
        private Dictionary<int, DepartmentCostInfoDto> CalculateDepartmentCosts(List<CurrentWorkspace> currentWorkspaces, decimal priceWorkspace)
        {
            return currentWorkspaces
                .Where(ws => ws.IdWorker != null)
                .Select(ws => _context.WorkerDetails.SingleOrDefault(wd => wd.IdWorker == ws.IdWorker))
                .Where(worker => worker != null && worker.IdDepartment != null)
                .GroupBy(worker => worker.IdDepartment.Value)
                .ToDictionary(
                    group => group.Key,
                    group => new DepartmentCostInfoDto
                    {
                        DepartmentName = group.First().DepartmentName,
                        TotalCost = group.Count() * priceWorkspace,
                        WorkspaceCount = group.Count()
                    });
        }

        // Создание Excel-отчета
        private string CreateExcelReport(Office office, decimal rentalPrice, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int totalWorkspacesCount, decimal priceWorkspace)
        {
            // Санитизация имени офиса для использования в имени файла
            var sanitizedOfficeName = Regex.Replace(office.OfficeName, @"[<>:""/\\|?*]", "");
            sanitizedOfficeName = sanitizedOfficeName.Replace(" ", "_");

            // Получение текущей даты и времени
            var currentDateTime = DateTime.Now;

            // Форматирование времени в строку (чч_мм_сс)
            var timeString = currentDateTime.ToString("HHmm");

            // Создание имени файла с добавлением времени
            var fileName = $"Отчет_{sanitizedOfficeName}_{currentDateTime:yyyyMMdd}_{timeString}.xlsx";

            var filePath = Path.Combine("wwwroot", "resources", "reports", fileName);

            using (var workbook = new XSSFWorkbook())
            {
                var sheet = workbook.CreateSheet("Отчет о стоимости офиса");

                // Создание стилей для ячеек
                var officeInfoStyle = CreateCellStyle(workbook, IndexedColors.Yellow.Index, true, 12);
                var headerStyle = CreateCellStyle(workbook, IndexedColors.BrightGreen.Index, true, 12);
                var departmentInfoStyle = CreateCellStyle(workbook, IndexedColors.LightGreen.Index, false, 11);
                var freeInfoStyle = CreateCellStyle(workbook, IndexedColors.Red.Index, true, 11);

                // Добавление информации о стоимости офиса и его площади
                AddOfficeInfoRow(sheet, office, rentalPrice, officeInfoStyle);

                // Добавление заголовков
                AddHeaderRow(sheet, headerStyle);

                // Заполнение данными по отделам
                FillDepartmentData(sheet, departmentCosts, departmentInfoStyle);

                // Добавление информации о свободных рабочих местах
                AddFreeWorkspacesInfo(sheet, departmentCosts, totalWorkspacesCount, priceWorkspace, freeInfoStyle);

                // Создание графика пирога
                CreatePieChart(sheet, departmentCosts, sheet.LastRowNum + 3);

                // Автоматическая подстройка ширины столбцов
                for (int i = 0; i < sheet.GetRow(0).LastCellNum; i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                // Сохранение файла
                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    Console.WriteLine("\n\n\n\n");
                    workbook.Write(fileStream);
                }
            }

            return filePath;
        }

        // Создание стиля ячейки
        private ICellStyle CreateCellStyle(IWorkbook workbook, short colorIndex, bool isBold, short fontSize)
        {
            var cellStyle = workbook.CreateCellStyle();
            var font = workbook.CreateFont();
            font.IsBold = isBold;
            font.FontHeightInPoints = fontSize;
            cellStyle.SetFont(font);
            cellStyle.FillForegroundColor = colorIndex;
            cellStyle.FillPattern = FillPattern.SolidForeground;
            return cellStyle;
        }

        // Добавление информации о стоимости офиса
        private void AddOfficeInfoRow(ISheet sheet, Office office, decimal rentalPrice, ICellStyle style)
        {
            var officeInfoRow = sheet.CreateRow(0);
            officeInfoRow.CreateCell(0).SetCellValue("Аренда офиса руб/мес");
            officeInfoRow.GetCell(0).CellStyle = style;
            officeInfoRow.CreateCell(1).SetCellValue((double)rentalPrice);
            officeInfoRow.GetCell(1).CellStyle = style;
            officeInfoRow.CreateCell(2).SetCellValue("Площадь офиса");
            officeInfoRow.GetCell(2).CellStyle = style;
            officeInfoRow.CreateCell(3).SetCellValue(office.Square.HasValue ? (double)office.Square.Value : 0);
            officeInfoRow.GetCell(3).CellStyle = style;

            // Добавление пустой строки для отступа
            sheet.CreateRow(1);
        }

        // Добавление заголовков
        private void AddHeaderRow(ISheet sheet, ICellStyle style)
        {
            var headerRow = sheet.CreateRow(2);
            headerRow.CreateCell(0).SetCellValue("Название отдела");
            headerRow.GetCell(0).CellStyle = style;
            headerRow.CreateCell(1).SetCellValue("Общая стоимость руб/мес");
            headerRow.GetCell(1).CellStyle = style;
            headerRow.CreateCell(2).SetCellValue("Количество рабочих мест");
            headerRow.GetCell(2).CellStyle = style;
        }

        // Заполнение данными по отделам
        private void FillDepartmentData(ISheet sheet, Dictionary<int, DepartmentCostInfoDto> departmentCosts, ICellStyle style)
        {
            int rowIndex = 3; // Начинаем с 3-й строки
            foreach (var departmentCost in departmentCosts.Values)
            {
                var row = sheet.CreateRow(rowIndex++);
                row.CreateCell(0).SetCellValue(departmentCost.DepartmentName);
                row.GetCell(0).CellStyle = style;
                row.CreateCell(1).SetCellValue((double)departmentCost.TotalCost);
                row.GetCell(1).CellStyle = style;
                row.CreateCell(2).SetCellValue(departmentCost.WorkspaceCount);
                row.GetCell(2).CellStyle = style;
            }
        }

        // Добавление информации о свободных рабочих местах
        private void AddFreeWorkspacesInfo(ISheet sheet, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int totalWorkspacesCount, decimal priceWorkspace, ICellStyle style)
        {
            // Подсчет свободных рабочих мест
            var occupiedWorkspacesCount = departmentCosts.Sum(dc => dc.Value.WorkspaceCount);
            var freeWorkspacesCount = totalWorkspacesCount - occupiedWorkspacesCount;
            var freeWorkspacesCost = freeWorkspacesCount * priceWorkspace;

            var freeRow = sheet.CreateRow(sheet.LastRowNum + 1);
            freeRow.CreateCell(0).SetCellValue("Свободные рабочие места");
            freeRow.GetCell(0).CellStyle = style;
            freeRow.CreateCell(1).SetCellValue((double)freeWorkspacesCost);
            freeRow.GetCell(1).CellStyle = style;
            freeRow.CreateCell(2).SetCellValue(freeWorkspacesCount);
            freeRow.GetCell(2).CellStyle = style;
        }

        // Создание графика пирога
        private void CreatePieChart(ISheet sheet, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int startRowIndex)
        {
            IDrawing drawing = sheet.CreateDrawingPatriarch();
            IClientAnchor anchor = drawing.CreateAnchor(0, 0, 0, 0, 5, 0, 15, startRowIndex + 13); // Позиция графика

            IChart pieChart = drawing.CreateChart(anchor);
            IChartLegend legend = pieChart.GetOrCreateLegend();
            legend.Position = LegendPosition.Right; // Позиция легенды

            // Создание данных для графика
            IPieChartData<string, double> data = pieChart.ChartDataFactory.CreatePieChartData<string, double>();

            // Определяем диапазоны для графика
            int departmentDataStartRow = 3; // Начальная строка для данных отделов
            int departmentDataEndRow = sheet.LastRowNum; // Конечная строка для данных отделов

            // Добавление данных для графика
            var series = data.AddSeries(
                DataSources.FromStringCellRange(sheet, new CellRangeAddress(departmentDataStartRow, departmentDataEndRow, 0, 0)), // Названия отделов
                DataSources.FromNumericCellRange(sheet, new CellRangeAddress(departmentDataStartRow, departmentDataEndRow, 1, 1)) // Общая стоимость
            );

            // Установка заголовка графика
            pieChart.SetTitle("Распределение стоимости аренды офиса");

            // Построение графика
            pieChart.Plot(data);
        }

        // Сохранение информации о отчете в БД
        private async Task SaveReportToDatabase(int reportTypeId, int idUser, string filePath)
        {
            var report = new Report
            {
                IdReportsTypes = reportTypeId,
                CreateDate = DateOnly.FromDateTime(DateTime.Now),
                Content = Path.GetFileName(filePath),
                IdUser = idUser
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
        }
    }
}