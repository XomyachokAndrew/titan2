import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IOfficeDto } from '../models/DTO';
import { IOffice } from '../models/Office';

/**
 * Сервис для работы с офисами.
 * Предоставляет методы для получения информации об офисах и конкретного офиса по его идентификатору.
 */
@Injectable({
  providedIn: 'root',
})
export class OfficeService {
  private apiUrl = `${environment.apiUrl}/Offices`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает информацию об офисе по его идентификатору.
   *
   * @param id - Идентификатор офиса.
   * @returns Observable, который возвращает информацию об офисе.
   */
  getOfficeById(id: number): Observable<IOffice> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IOffice>(url).pipe(catchError(this.handleError));
  }

  /**
   * Получает список всех офисов.
   *
   * @returns Observable, который возвращает массив офисов.
   */
  getOffices(): Observable<IOfficeDto[]> {
    return this.http
      .get<IOfficeDto[]>(this.apiUrl)
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
