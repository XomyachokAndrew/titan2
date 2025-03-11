import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IFloorDto } from '../models/DTO';

/**
 * Сервис для работы с этажами.
 * Предоставляет методы для получения этажей по идентификатору офиса и получения информации об этаже по его идентификатору.
 */
@Injectable({
  providedIn: 'root',
})
export class FloorService {
  private url = `${environment.apiUrl}/floors`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список этажей по идентификатору офиса.
   *
   * @param id - Идентификатор офиса.
   * @returns Observable, который возвращает массив этажей.
   */
  getFloorsByOfficeId(id: number): Observable<IFloorDto[]> {
    const url = `${this.url}/office/${id}`;
    return this.http.get<IFloorDto[]>(url).pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию об этаже по его идентификатору.
   *
   * @param id - Идентификатор этажа.
   * @returns Observable, который возвращает информацию об этаже.
   */
  getFloor(id: number): Observable<IFloorDto> {
    const url = `${this.url}/${id}`;
    return this.http.get<IFloorDto>(url).pipe(catchError(this.handleError));
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
