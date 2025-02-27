using backend.Data;
using backend.Models;
using backend.ModelsDto;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel.Charts;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public class ReportService : IReportService
    {
        private readonly Context _context;

        public ReportService(Context context)
        {
            _context = context;
        }

        /// <summary>
        /// Генерирует отчет о стоимости аренды для указанного офиса.
        /// </summary>
        /// <param name="officeId">Идентификатор офиса.</param>
        /// <param name="reportTypeId">Идентификатор типа отчета.</param>
        /// <param name="idUser">Идентификатор пользователя, создавшего отчет.</param>
        /// <returns>Путь к сгенерированному файлу отчета.</returns>
        /// <exception cref="InvalidOperationException">Выбрасывается, если офис или договор аренды не найдены.</exception>
        public async Task<string> GenerateRentalCostReportAsync(int officeId, int reportTypeId, int idUser)
        {
            var office = await GetOfficeWithDetailsAsync(officeId);
            if (office == null)
            {
                throw new InvalidOperationException("Офис не найден.");
            }

            var roomIds = await GetRoomIdsAsync(office);
            var currentWorkspaces = await GetCurrentWorkspacesAsync(roomIds);
            var reservedWorkspaces = await GetReservedWorkspacesAsync(roomIds);
            var rentalAgreement = office.RentalAgreements.FirstOrDefault();
            if (rentalAgreement == null)
            {
                throw new InvalidOperationException("Нет договора аренды для этого офиса.");
            }

            decimal priceWorkspace = await CalculateWorkspacePriceAsync(rentalAgreement.Price, currentWorkspaces.Count());
            var departmentCosts = await CalculateDepartmentCostsAsync(currentWorkspaces, priceWorkspace);
            await CalculateReservedWorkspacesCostsAsync(reservedWorkspaces, departmentCosts, priceWorkspace);
            var filePath = await CreateExcelReportAsync(office, rentalAgreement.Price, departmentCosts, currentWorkspaces.Count(), priceWorkspace, reservedWorkspaces, roomIds);
            await SaveReportToDatabaseAsync(reportTypeId, idUser, filePath);

            return filePath; // Возвращаем путь к файлу
        }

        /// <summary>
        /// Получает офис с деталями по указанному идентификатору.
        /// </summary>
        /// <param name="officeId">Идентификатор офиса.</param>
        /// <returns>Офис с деталями.</returns>
        private async Task<Office> GetOfficeWithDetailsAsync(int officeId)
        {
            return await _context.Offices
                .Include(o => o.RentalAgreements)
                .Include(o => o.Floors)
                    .ThenInclude(f => f.Rooms)
                .FirstOrDefaultAsync(o => o.IdOffice == officeId);
        }

        /// <summary>
        /// Получает идентификаторы комнат для указанного офиса.
        /// </summary>
        /// <param name="office">Офис.</param>
        /// <returns>Список идентификаторов комнат.</returns>
        private async Task<List<int>> GetRoomIdsAsync(Office office)
        {
            return await Task.Run(() => office.Floors
                .SelectMany(f => f.Rooms)
                .Select(r => r.IdRoom)
                .ToList());
        }

        /// <summary>
        /// Получает текущие рабочие места для указанных идентификаторов комнат.
        /// </summary>
        /// <param name="roomIds">Список идентификаторов комнат.</param>
        /// <returns>Список текущих рабочих мест.</returns>
        private async Task<List<CurrentWorkspace>> GetCurrentWorkspacesAsync(List<int> roomIds)
        {
            return await _context.CurrentWorkspaces
                .Where(ws => ws.IdRoom != null && roomIds.Contains(ws.IdRoom.Value))
                .ToListAsync();
        }

        /// <summary>
        /// Получает зарезервированные рабочие места для указанных идентификаторов комнат.
        /// </summary>
        /// <param name="roomIds">Список идентификаторов комнат.</param>
        /// <returns>Список зарезервированных рабочих мест.</returns>
        private async Task<List<StatusesWorkspace>> GetReservedWorkspacesAsync(List<int> roomIds)
        {
            return await _context.StatusesWorkspaces
                .Include(ws => ws.IdWorkspaceNavigation)
                .Where(ws => ws.IdWorkspaceReservationsStatuses != null &&
                             roomIds.Contains(ws.IdWorkspaceNavigation.IdRoom))
                .ToListAsync();
        }

        /// <summary>
        /// Рассчитывает стоимость рабочего места на основе арендной платы и количества рабочих мест.
        /// </summary>
        /// <param name="rentalPrice">Арендная плата.</param>
        /// <param name="workspaceCount">Количество рабочих мест.</param>
        /// <returns>Стоимость одного рабочего места.</returns>
        private async Task<decimal> CalculateWorkspacePriceAsync(decimal rentalPrice, int workspaceCount)
        {
            return await Task.Run(() => workspaceCount > 0 ? Math.Round(rentalPrice / workspaceCount, 3) : 0);
        }

        /// <summary>
        /// Рассчитывает затраты по отделам на основе текущих рабочих мест и стоимости рабочего места.
        /// </summary>
        /// <param name="currentWorkspaces">Список текущих рабочих мест.</param>
        /// <param name="priceWorkspace">Стоимость одного рабочего места.</param>
        /// <returns>Словарь с информацией о затратах по отделам.</returns>
        private async Task<Dictionary<int, DepartmentCostInfoDto>> CalculateDepartmentCostsAsync(List<CurrentWorkspace> currentWorkspaces, decimal priceWorkspace)
        {
            return await Task.Run(() => currentWorkspaces
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
                    }));
        }

        /// <summary>
        /// Рассчитывает затраты по зарезервированным рабочим местам и обновляет информацию по отделам.
        /// </summary>
        /// <param name="reservedWorkspaces">Список зарезервированных рабочих мест.</param>
        /// <param name="departmentCosts">Словарь с информацией о затратах по отделам.</param>
        /// <param name="priceWorkspace">Стоимость одного рабочего места.</param>
        private async Task CalculateReservedWorkspacesCostsAsync(List<StatusesWorkspace> reservedWorkspaces, Dictionary<int, DepartmentCostInfoDto> departmentCosts, decimal priceWorkspace)
        {
            foreach (var reserved in reservedWorkspaces)
            {
                var workerDetail = await _context.WorkerDetails
                                    .SingleOrDefaultAsync(wd => wd.IdWorker == reserved.IdWorker);

                if (workerDetail == null || workerDetail.IdDepartment == null)
                {
                    continue; // Пропускаем, если работник или отдел не найдены
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

        /// <summary>
        /// Создает Excel-отчет о стоимости аренды офиса.
        /// </summary>
        /// <param name="office">Офис.</param>
        /// <param name="rentalPrice">Арендная плата.</param>
        /// <param name="departmentCosts">Словарь с информацией о затратах по отделам.</param>
        /// <param name="totalWorkspacesCount">Общее количество рабочих мест.</param>
        /// <param name="priceWorkspace">Стоимость одного рабочего места.</param>
        /// <param name="reservedWorkspaces">Список зарезервированных рабочих мест.</param>
        /// <param name="roomIds">Список идентификаторов комнат.</param>
        /// <returns>Путь к созданному файлу отчета.</returns>
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

                await AddOfficeInfoRowAsync(sheet, office, rentalPrice, officeInfoStyle);
                AddHeaderRow(sheet, headerStyle);
                FillDepartmentData(sheet, departmentCosts, departmentInfoStyle);
                await AddFreeWorkspacesInfoAsync(sheet, departmentCosts, totalWorkspacesCount, priceWorkspace, roomIds, freeInfoStyle);
                int reservedWorkspacesCount = reservedWorkspaces.Count;
                await AddReservedWorkspacesCountAsync(sheet, reservedWorkspacesCount, priceWorkspace, reservedInfoStyle);
                CreatePieChart(sheet, departmentCosts, sheet.LastRowNum + 3);

                // Автоматически подгоняем ширину столбцов
                for (int i = 0; i < sheet.GetRow(0).LastCellNum; i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                // Записываем файл на диск
                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await Task.Run(() => workbook.Write(fileStream)); // Асинхронное выполнение записи в файл
                }
            }

            return filePath; // Возвращаем путь к файлу
        }

        /// <summary>
        /// Добавляет информацию о количестве зарезервированных рабочих мест в отчет.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="reservedCount">Количество зарезервированных рабочих мест.</param>
        /// <param name="priceWorkspace">Стоимость одного рабочего места.</param>
        /// <param name="style">Стиль ячеек.</param>
        private async Task AddReservedWorkspacesCountAsync(ISheet sheet, int reservedCount, decimal priceWorkspace, ICellStyle style)
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

        /// <summary>
        /// Создает стиль ячейки для отчета.
        /// </summary>
        /// <param name="workbook">Рабочая книга.</param>
        /// <param name="colorIndex">Индекс цвета фона.</param>
        /// <param name="isBold">Указывает, является ли текст жирным.</param>
        /// <param name="fontSize">Размер шрифта.</param>
        /// <returns>Созданный стиль ячейки.</returns>
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

        /// <summary>
        /// Добавляет информацию об офисе в отчет.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="office">Офис.</param>
        /// <param name="rentalPrice">Арендная плата.</param>
        /// <param name="style">Стиль ячеек.</param>
        private async Task AddOfficeInfoRowAsync(ISheet sheet, Office office, decimal rentalPrice, ICellStyle style)
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

        /// <summary>
        /// Добавляет заголовок таблицы в отчет.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="style">Стиль ячеек.</param>
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

        /// <summary>
        /// Заполняет данные по отделам в отчет.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="departmentCosts">Словарь с информацией о затратах по отделам.</param>
        /// <param name="style">Стиль ячеек.</param>
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

        /// <summary>
        /// Добавляет информацию о свободных рабочих местах в отчет.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="departmentCosts">Словарь с информацией о затратах по отделам.</param>
        /// <param name="totalWorkspacesCount">Общее количество рабочих мест.</param>
        /// <param name="priceWorkspace">Стоимость одного рабочего места.</param>
        /// <param name="roomIds">Список идентификаторов комнат.</param>
        /// <param name="style">Стиль ячеек.</param>
        private async Task AddFreeWorkspacesInfoAsync(ISheet sheet, Dictionary<int, DepartmentCostInfoDto> departmentCosts, int totalWorkspacesCount, decimal priceWorkspace, List<int> roomIds, ICellStyle style)
        {
            var occupiedWorkspacesCount = departmentCosts.Sum(dc => dc.Value.WorkspaceCount);
            var reservedWorkspacesCount = await _context.StatusesWorkspaces
                .Include(ws => ws.IdWorkspaceNavigation)
                .CountAsync(ws => ws.IdWorkspaceReservationsStatuses != null &&
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

        /// <summary>
        /// Создает круговую диаграмму на основе данных по отделам.
        /// </summary>
        /// <param name="sheet">Лист отчета.</param>
        /// <param name="departmentCosts">Словарь с информацией о затратах по отделам.</param>
        /// <param name="startRowIndex">Строка, с которой начинается диаграмма.</param>
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

        /// <summary>
        /// Сохраняет отчет в базе данных.
        /// </summary>
        /// <param name="reportTypeId">Идентификатор типа отчета.</param>
        /// <param name="idUser">Идентификатор пользователя, создавшего отчет.</param>
        /// <param name="filePath">Путь к файлу отчета.</param>
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
            await _context.SaveChangesAsync(); // Сохраняем изменения в базе данных
        }

        private async Task<string> CreateExcelReportAsync(Office office)
        {
            var sanitizedOfficeName = Regex.Replace(office.OfficeName, @"[<>:""/\\|?*]", "");
            sanitizedOfficeName = sanitizedOfficeName.Replace(" ", "_");
            var currentDateTime = DateTime.Now;
            var timeString = currentDateTime.ToString("HHmm");
            var fileName = $"Отчет_{sanitizedOfficeName}_{currentDateTime:yyyyMMdd}_{timeString}.xlsx";
            var filePath = Path.Combine("wwwroot", "resources", "reports", fileName);

            using (var workbook = new XSSFWorkbook())
            {
                foreach (var floor in office.Floors)
                {
                    var sheet = workbook.CreateSheet($"Этаж {floor.NumberFloor}");

                    // Установка стиля для заголовка этажа
                    var floorStyle = CreateCellStyle(workbook, IndexedColors.LightBlue.Index, true, 14);
                    var floorRow = sheet.CreateRow(0);
                    floorRow.CreateCell(0).SetCellValue($"Этаж {floor.NumberFloor}");
                    floorRow.GetCell(0).CellStyle = floorStyle;

                    // Заголовки для столбцов
                    var headerStyle = CreateCellStyle(workbook, IndexedColors.BrightGreen.Index, true, 12);
                    var headerRow = sheet.CreateRow(1);
                    headerRow.CreateCell(0).SetCellValue("Кабинет");
                    headerRow.CreateCell(1).SetCellValue("Рабочее место");
                    headerRow.CreateCell(2).SetCellValue("Работник");
                    headerRow.CreateCell(3).SetCellValue("Должность");
                    headerRow.CreateCell(4).SetCellValue("Отдел");
                    headerRow.CreateCell(5).SetCellValue("Статус");
                    headerRow.CreateCell(6).SetCellValue("Дата начала");
                    headerRow.CreateCell(7).SetCellValue("Дата окончания");

                    int rowIndex = 2; // Начинаем с третьей строки

                    foreach (var room in floor.Rooms)
                    {
                        // Добавляем заголовок для кабинета
                        var roomStyle = CreateCellStyle(workbook, IndexedColors.LightGreen.Index, true, 12);
                        var roomRow = sheet.CreateRow(rowIndex++);
                        roomRow.CreateCell(0).SetCellValue($"Кабинет: {room.Name}");
                        roomRow.GetCell(0).CellStyle = roomStyle;

                        var currentWorkspaces = await _context.CurrentWorkspaces
                            .Where(ws => ws.IdRoom == room.IdRoom)
                            .ToListAsync();

                        foreach (var workspace in currentWorkspaces)
                        {
                            var workerDetail = await _context.WorkerDetails
                                .SingleOrDefaultAsync(wd => wd.IdWorker == workspace.IdWorker);

                            var row = sheet.CreateRow(rowIndex++);
                            row.CreateCell(0).SetCellValue(""); // Пустая ячейка для отступа
                            row.CreateCell(1).SetCellValue(workspace.WorkspaceName);

                            // Добавляем информацию о работнике
                            if (workerDetail != null)
                            {
                                row.CreateCell(2).SetCellValue(workerDetail.FullWorkerName);
                                row.CreateCell(3).SetCellValue(workerDetail.PostName ?? "-");
                                row.CreateCell(4).SetCellValue(workerDetail.DepartmentName ?? "-");
                            }
                            else
                            {
                                row.CreateCell(2).SetCellValue("Свободно");
                                row.CreateCell(3).SetCellValue("-");
                                row.CreateCell(4).SetCellValue("-");
                            }

                            // Добавляем информацию о статусах и датах
                            row.CreateCell(5).SetCellValue(workspace.WorkspaceStatusTypeName ?? "-");
                            row.CreateCell(6).SetCellValue(workspace.StartDate?.ToString("yyyy-MM-dd") ?? "-");
                            row.CreateCell(7).SetCellValue(workspace.EndDate?.ToString("yyyy-MM-dd") ?? "-");
                        }
                    }
                }

                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await Task.Run(() => workbook.Write(fileStream)); // Асинхронное выполнение записи в файл
                }
            }

            return filePath; // Возвращаем путь к файлу
        }

        public async Task<string> GenerateOfficeReportAsync(int officeId, int reportTypeId, int idUser)
        {
            var office = await GetOfficeWithDetailsAsync(officeId);
            if (office == null)
            {
                throw new InvalidOperationException("Офис не найден.");
            }

            var filePath = await CreateExcelReportAsync(office);
            await SaveReportToDatabaseAsync(reportTypeId, idUser, filePath);

            return filePath; // Возвращаем путь к файлу
        }
    }
}


