using backend.Data;
using backend.Models;
using backend.ModelsDto;
using backend.Services;
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
        private readonly IReportService _reportService;

        // Инициализирует новый экземпляр класса <see cref="ReportController"/>.
        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Генерирует EXCEL отчет о распределении стоимости аренды для конкретного офиса.
        /// </summary>
        /// <param name="officeId">Идентификатор офиса, для которого генерируется отчет.</param>
        /// <param name="reportTypeId">Идентификатор типа отчета.</param>
        /// <param name="idUser">Идентификатор пользователя, запрашивающего отчет.</param>
        /// <returns>Объект <see cref="IActionResult"/>, содержащий сгенерированный файл отчета или ответ с ошибкой.</returns>
        [HttpGet("{reportTypeId}/{officeId}")]
        public async Task<IActionResult> GetRentalCost(int officeId, int reportTypeId, int idUser)
        {
            try
            {
                // Генерация отчета и получение пути к файлу
                var filePath = await _reportService.GenerateRentalCostReportAsync(officeId, reportTypeId, idUser);

                // Чтение байтов файла для отправки клиенту
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);

                // Возвращение файла в ответе
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                // Возвращение ошибки сервера в случае исключения
                return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
            }
        }

        /// <summary>
        /// Генерирует EXCEL отчет реестра рабочих мест для конкретного офиса.
        /// </summary>
        /// <param name="officeId">Идентификатор офиса.</param>
        /// <param name="reportTypeId">Идентификатор типа отчета.</param>
        /// <param name="idUser">Идентификатор пользователя, запрашивающего отчет.</param>
        /// <returns>Файл отчета в формате Excel.</returns>
        [HttpGet("office/{officeId}/{reportTypeId}/{idUser}")]
        public async Task<IActionResult> GetOfficeReport(int officeId, int reportTypeId, int idUser)
        {
            try
            {
                // Генерация отчета и получение пути к файлу
                // Вызов сервиса для генерации отчета, который возвращает путь к созданному файлу
                var filePath = await _reportService.GenerateOfficeReportAsync(officeId, reportTypeId, idUser);

                // Чтение байтов файла для отправки клиенту
                // Асинхронное чтение содержимого файла в виде массива байтов
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);

                // Возвращение файла в ответе
                // Возвращаем файл с соответствующим MIME-типом для Excel
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                // Возвращение ошибки сервера в случае исключения
                // Обработка исключений и возврат статуса 500 с сообщением об ошибке
                return StatusCode(500, $"Внутренняя ошибка сервера: {ex.Message}");
            }
        }
    }
}