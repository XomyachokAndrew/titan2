import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkersStatusesType } from '../models/WorkersStatusesType';
import { environment } from '../../../environments/environment';

/**
 * Сервис для работы с типами статусов работников.
 * Предоставляет методы для получения, создания, обновления и удаления типов статусов работников.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkersStatusesTypeService {
  private apiUrl = `${environment.apiUrl}/WorkersStatusesTypes`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список всех типов статусов работников.
   *
   * @returns Observable, который возвращает массив типов статусов работников.
   */
  getWorkersStatusesTypes(): Observable<IWorkersStatusesType[]> {
    return this.http
      .get<IWorkersStatusesType[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о типе статуса работника по его идентификатору.
   *
   * @param id - Идентификатор типа статуса работника.
   * @returns Observable, который возвращает информацию о типе статуса работника.
   */
  getWorkersStatusesType(id: number): Observable<IWorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .get<IWorkersStatusesType>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет информацию о типе статуса работника по его идентификатору.
   *
   * @param id - Идентификатор типа статуса работника.
   * @param workersStatusesType - Обновленные данные типа статуса работника.
   * @returns Observable, который возвращает результат обновления.
   */
  updateWorkersStatusesType(
    id: number,
    workersStatusesType: IWorkersStatusesType
  ): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .put(url, workersStatusesType)
      .pipe(catchError(this.handleError));
  }

  /**
   * Создает новый тип статуса работника.
   *
   * @param workersStatusesType - Данные нового типа статуса работника.
   * @returns Observable, который возвращает созданный тип статуса работника.
   */
  createWorkersStatusesType(
    workersStatusesType: IWorkersStatusesType
  ): Observable<IWorkersStatusesType> {
    return this.http
      .post<IWorkersStatusesType>(this.apiUrl, workersStatusesType)
      .pipe(catchError(this.handleError));
  }

  /**
   * Удаляет тип статуса работника по его идентификатору.
   *
   * @param id - Идентификатор типа статуса работника.
   * @returns Observable, который возвращает результат удаления.
   */
  deleteWorkersStatusesType(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url).pipe(catchError(this.handleError));
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
