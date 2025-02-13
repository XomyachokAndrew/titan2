using backend.Data;
using backend.Models;
using backend.ModelsDto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel;
using NPOI.SS.UserModel.Charts;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System.Text.RegularExpressions;

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

        [HttpGet("{reportTypeId}/{officeId}")]
        public async Task<IActionResult> GetRentalCost(int officeId, int reportTypeId, int idUser)
        {
            try
            {
                var office = await GetOfficeWithDetailsAsync(officeId);
                if (office == null)
                {
                    return NotFound("Офис не найден.");
                }

                var roomIds = GetRoomIds(office);
                var currentWorkspaces = await GetCurrentWorkspacesAsync(roomIds);
                var reservedWorkspaces = await GetReservedWorkspacesAsync(roomIds);
                var rentalAgreement = office.RentalAgreements.FirstOrDefault();
                if (rentalAgreement == null)
                {
                    return NotFound("Нет договора аренды для этого офиса.");
                }

                decimal priceWorkspace = CalculateWorkspacePrice(rentalAgreement.Price, currentWorkspaces.Count());
                var departmentCosts = CalculateDepartmentCosts(currentWorkspaces, priceWorkspace);
                CalculateReservedWorkspacesCosts(reservedWorkspaces, departmentCosts, priceWorkspace);
                var filePath = await CreateExcelReportAsync(office, rentalAgreement.Price, departmentCosts, currentWorkspaces.Count(), priceWorkspace, reservedWorkspaces, roomIds);
                await SaveReportToDatabaseAsync(reportTypeId, idUser, filePath);

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
            }
        }

        private async Task<Office> GetOfficeWithDetailsAsync(int officeId)
        {
            return await _context.Offices
                .Include(o => o.RentalAgreements)
                .Include(o => o.Floors)
                    .ThenInclude(f => f.Rooms)
                .FirstOrDefaultAsync(o => o.IdOffice == officeId);
        }

        private List<int> GetRoomIds(Office office)
        {
            return office.Floors
                .SelectMany(f => f.Rooms)
                .Select(r => r.IdRoom)
                .ToList();
        }

        private async Task<List<CurrentWorkspace>> GetCurrentWorkspacesAsync(List<int> roomIds)
        {
            return await _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom != null && roomIds.Contains(ws.IdRoom.Value))
                .ToListAsync();
        }

        private async Task<List<StatusesWorkspace>> GetReservedWorkspacesAsync(List<int> roomIds)
        {
            return await _context.StatusesWorkspaces
                .Include(ws => ws.IdWorkspaceNavigation)
                .Where(ws => ws.IdWorkspaceReservationsStatuses != null &&
                             roomIds.Contains(ws.IdWorkspaceNavigation.IdRoom))
                .ToListAsync();
        }

        private decimal CalculateWorkspacePrice(decimal rentalPrice, int workspaceCount)
        {
            return workspaceCount > 0 ? Math.Round(rentalPrice / workspaceCount, 3) : 0;
        }

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

        private void CalculateReservedWorkspacesCosts(List<StatusesWorkspace> reservedWorkspaces, Dictionary<int, DepartmentCostInfoDto> departmentCosts, decimal priceWorkspace)
        {
            foreach (var reserved in reservedWorkspaces)
            {
                var workerDetail = _context.WorkerDetails.SingleOrDefault(wd => wd.IdWorker == reserved.IdWorker);

                if (workerDetail == null || workerDetail.IdDepartment == null)
                {
                    continue;
                }

                if (departmentCosts.TryGetValue(workerDetail.IdDepartment.Value, out var departmentCostInfo))
                {
                    // Если запись существует, обновляем её
                    departmentCostInfo.TotalCost += priceWorkspace;
                    departmentCostInfo.WorkspaceCount += 1;
                }
                else
                {
                    // Если записи нет, создаем новую
                    departmentCosts[workerDetail.IdDepartment.Value] = new DepartmentCostInfoDto
                    {
                        DepartmentName = workerDetail.DepartmentName,
                        TotalCost = priceWorkspace,
                        WorkspaceCount = 1
                    };
                }
            }
        }

        private async Task<string> CreateExcelReportAsync(Office office, decimal rentalPrice, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int totalWorkspacesCount, decimal priceWorkspace, List<StatusesWorkspace> reservedWorkspaces, List<int> roomIds)
        {
            var sanitizedOfficeName = Regex.Replace(office.OfficeName, @"[<>:""/\\|?*]", "");
            sanitizedOfficeName = sanitizedOfficeName.Replace(" ", "_");
            var currentDateTime = DateTime.Now;
            var timeString = currentDateTime.ToString("HHmm");
            var fileName = $"Отчет_{sanitizedOfficeName}_{currentDateTime:yyyyMMdd}_{timeString}.xlsx";
            var filePath = Path.Combine("wwwroot", "resources", "reports", fileName);

            using (var workbook = new XSSFWorkbook())
            {
                var sheet = workbook.CreateSheet("Отчет о стоимости офиса");
                var officeInfoStyle = CreateCellStyle(workbook, IndexedColors.Yellow.Index, true, 12);
                var headerStyle = CreateCellStyle(workbook, IndexedColors.BrightGreen.Index, true, 12);
                var departmentInfoStyle = CreateCellStyle(workbook, IndexedColors.LightGreen.Index, false, 11);
                var freeInfoStyle = CreateCellStyle(workbook, IndexedColors.Red.Index, true, 11);
                var reservedInfoStyle = CreateCellStyle(workbook, IndexedColors.LightBlue.Index, false, 11);

                AddOfficeInfoRow(sheet, office, rentalPrice, officeInfoStyle);
                AddHeaderRow(sheet, headerStyle);
                FillDepartmentData(sheet, departmentCosts, departmentInfoStyle);
                AddFreeWorkspacesInfo(sheet, departmentCosts, totalWorkspacesCount, priceWorkspace, roomIds, freeInfoStyle);
                int reservedWorkspacesCount = reservedWorkspaces.Count;
                AddReservedWorkspacesCount(sheet, reservedWorkspacesCount, priceWorkspace, reservedInfoStyle);
                CreatePieChart(sheet, departmentCosts, sheet.LastRowNum + 3);

                for (int i = 0; i < sheet.GetRow(0).LastCellNum; i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await Task.Run(() => workbook.Write(fileStream)); // Асинхронное выполнение записи в файл
                }
            }

            return filePath;
        }

        private void AddReservedWorkspacesCount(ISheet sheet, int reservedCount, decimal priceWorkspace, ICellStyle style)
        {
            var reservedRow = sheet.CreateRow(sheet.LastRowNum + 1);
            decimal reservedCost = reservedCount * priceWorkspace;
            reservedRow.CreateCell(0).SetCellValue("Количество забронированных рабочих мест:");
            reservedRow.GetCell(0).CellStyle = style;
            reservedRow.CreateCell(1).SetCellValue((double)reservedCost);
            reservedRow.GetCell(1).CellStyle = style;
            reservedRow.CreateCell(2).SetCellValue(reservedCount);
            reservedRow.GetCell(2).CellStyle = style;
        }

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

        private void AddFreeWorkspacesInfo(ISheet sheet, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int totalWorkspacesCount, decimal priceWorkspace, List<int> roomIds, ICellStyle style)
        {
            var occupiedWorkspacesCount = departmentCosts.Sum(dc => dc.Value.WorkspaceCount);
            var reservedWorkspacesCount = _context.StatusesWorkspaces
                .Include(ws => ws.IdWorkspaceNavigation)
                .Count(ws => ws.IdWorkspaceReservationsStatuses != null &&
                             roomIds.Contains(ws.IdWorkspaceNavigation.IdRoom));

            var freeWorkspacesCount = totalWorkspacesCount - occupiedWorkspacesCount - reservedWorkspacesCount;
            var freeWorkspacesCost = freeWorkspacesCount * priceWorkspace;

            var freeRow = sheet.CreateRow(sheet.LastRowNum + 1);
            freeRow.CreateCell(0).SetCellValue("Свободные рабочие места");
            freeRow.GetCell(0).CellStyle = style;
            freeRow.CreateCell(1).SetCellValue((double)freeWorkspacesCost);
            freeRow.GetCell(1).CellStyle = style;
            freeRow.CreateCell(2).SetCellValue(freeWorkspacesCount);
            freeRow.GetCell(2).CellStyle = style;
        }

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

        private async Task SaveReportToDatabaseAsync(int reportTypeId, int idUser, string filePath)
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


