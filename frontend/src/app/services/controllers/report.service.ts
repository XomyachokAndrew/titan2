import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';

/**
 * Сервис для генерации отчетов.
 * Предоставляет методы для получения отчетов в формате Blob.
 */
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private url = `${environment.apiUrl}/report`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает отчет по аренде помещений.
   *
   * @param reportTypeId - Идентификатор типа отчета.
   * @param officeId - Идентификатор офиса.
   * @param idUser - Идентификатор пользователя.
   * @returns Observable, который возвращает отчет в формате Blob.
   */
  getRentalCost(
    reportTypeId: number,
    officeId: number,
    idUser: number
  ): Observable<Blob> {
    const resultUrl = `${this.url}/${reportTypeId}/${officeId}?idUser=${idUser}`;
    return this.http
      .get(resultUrl, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  /**
   * Обработчик ошибок для HTTP-запросов.
   *
   * @param error - Объект ошибки.
   * @returns Observable, который возвращает сообщение об ошибке.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Ошибки на стороне клиента
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Ошибки на стороне сервера
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
