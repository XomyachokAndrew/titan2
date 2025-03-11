import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IStatusWorkerDto, IWorkerDto } from '../models/DTO';
import { IWorkerDetail } from '../models/WorkerDetail';
import { IWorker } from '@models/Worker';

/**
 * Сервис для работы с работниками.
 * Предоставляет методы для получения, создания, обновления и удаления работников, а также управления их статусами.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/workers`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список всех работников.
   *
   * @returns Observable, который возвращает массив работников.
   */
  getWorkers(): Observable<IWorkerDetail[]> {
    return this.http
      .get<IWorkerDetail[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о работнике по его идентификатору.
   *
   * @param id - Идентификатор работника.
   * @returns Observable, который возвращает информацию о работнике.
   */
  getWorker(id: number): Observable<IWorkerDetail> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IWorkerDetail>(url).pipe(catchError(this.handleError));
  }

  /**
   * Обновляет информацию о работнике по его идентификатору.
   *
   * @param id - Идентификатор работника.
   * @param workerDto - Обновленные данные работника.
   * @returns Observable, который возвращает результат обновления.
   */
  updateWorker(id: number, workerDto: IWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/update/${id}`;
    return this.http.put(url, workerDto).pipe(catchError(this.handleError));
  }

  /**
   * Добавляет новый статус работника.
   *
   * @param statusWorkerDto - Данные нового статуса работника.
   * @returns Observable, который возвращает результат добавления статуса.
   */
  addStatusWorker(statusWorkerDto: IStatusWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/status/add`;
    return this.http
      .post(url, statusWorkerDto)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет дату окончания работы работника по его идентификатору.
   *
   * @param id - Идентификатор работника.
   * @param endDate - Новая дата окончания работы.
   * @returns Observable, который возвращает результат обновления даты.
   */
  updateEndDate(id: number, endDate?: string): Observable<any> {
    const url = `${this.apiUrl}/update-end-date/${id}`;
    return this.http.put(url, { endDate }).pipe(catchError(this.handleError));
  }

  /**
   * Обновляет статус работника по его идентификатору.
   *
   * @param id - Идентификатор работника.
   * @param updatedStatusDto - Обновленные данные статуса работника.
   * @returns Observable, который возвращает результат обновления статуса.
   */
  updateStatus(
    id: number,
    updatedStatusDto: IStatusWorkerDto
  ): Observable<any> {
    const url = `${this.apiUrl}/status/update/${id}`;
    return this.http
      .put(url, updatedStatusDto)
      .pipe(catchError(this.handleError));
  }

  /**
   * Добавляет нового работника.
   *
   * @param workerDto - Данные нового работника.
   * @returns Observable, который возвращает результат добавления работника.
   */
  addWorker(workerDto: IWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/add`;
    return this.http.post(url, workerDto).pipe(catchError(this.handleError));
  }

  /**
   * Удаляет работника по его идентификатору.
   *
   * @param id - Идентификатор работника.
   * @returns Observable, который возвращает результат удаления работника.
   */
  deleteWorker(id: number): Observable<any> {
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
