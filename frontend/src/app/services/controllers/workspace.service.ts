import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICurrentWorkspace } from '../models/CurrentWorkspace';
import {
  IWorkspaceInfoDto,
  IStatusWorkspaceDto,
  IWorkspaceDto,
} from '../models/DTO';
import { environment } from '../../../environments/environment';
import { IHistoryWorkspaceStatus } from '../models/HistoryWorkspaceStatus';

/**
 * Сервис для работы с рабочими пространствами.
 * Предоставляет методы для получения, создания, обновления и удаления рабочих пространств, а также управления их статусами.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private url = `${environment.apiUrl}/workspace`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список рабочих пространств по идентификатору комнаты.
   *
   * @param roomId - Идентификатор комнаты.
   * @returns Observable, который возвращает массив рабочих пространств.
   */
  getWorkspacesByRoom(roomId: number): Observable<ICurrentWorkspace[]> {
    const url = `${this.url}/room/${roomId}`;
    return this.http
      .get<ICurrentWorkspace[]>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о рабочем пространстве по его идентификатору.
   *
   * @param id - Идентификатор рабочего пространства.
   * @returns Observable, который возвращает информацию о рабочем пространстве.
   */
  getWorkspaceInfo(id: number): Observable<IWorkspaceInfoDto> {
    const url = `${this.url}/info/${id}`;
    return this.http
      .get<IWorkspaceInfoDto>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает историю статусов рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор рабочего пространства.
   * @returns Observable, который возвращает историю статусов рабочего пространства.
   */
  getWorkspaceHistory(id: number): Observable<IHistoryWorkspaceStatus[]> {
    const url = `${this.url}/history/${id}`;
    return this.http
      .get<IHistoryWorkspaceStatus[]>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Добавляет новый статус рабочего пространства.
   *
   * @param statusWorkspaceDto - Данные нового статуса рабочего пространства.
   * @returns Observable, который возвращает результат добавления статуса.
   */
  addStatusWorkspace(statusWorkspaceDto: IStatusWorkspaceDto): Observable<any> {
    const url = `${this.url}/status/add`;
    return this.http
      .post(url, statusWorkspaceDto)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет дату окончания работы рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор рабочего пространства.
   * @param endDate - Новая дата окончания работы.
   * @returns Observable, который возвращает результат обновления даты.
   */
  updateEndDate(id: number, endDate?: string): Observable<any> {
    const url = `${this.url}/update-end-date/${id}`;
    return this.http.put(url, { endDate }).pipe(catchError(this.handleError));
  }

  /**
   * Обновляет статус рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор рабочего пространства.
   * @param updatedStatusDto - Обновленные данные статуса рабочего пространства.
   * @returns Observable, который возвращает результат обновления статуса.
   */
  updateStatus(
    id: number,
    updatedStatusDto: IStatusWorkspaceDto
  ): Observable<any> {
    const url = `${this.url}/UpdateStatus/${id}`;
    return this.http
      .put(url, updatedStatusDto)
      .pipe(catchError(this.handleError));
  }

  /**
   * Добавляет новое рабочее пространство.
   *
   * @param workspaceDto - Данные нового рабочего пространства.
   * @returns Observable, который возвращает результат добавления рабочего пространства.
   */
  addWorkspace(workspaceDto: IWorkspaceDto): Observable<any> {
    const url = `${this.url}/add`;
    return this.http.post(url, workspaceDto).pipe(catchError(this.handleError));
  }

  /**
   * Удаляет рабочее пространство по его идентификатору.
   *
   * @param id - Идентификатор рабочего пространства.
   * @returns Observable, который возвращает результат удаления рабочего пространства.
   */
  deleteWorkspace(id: number): Observable<any> {
    const url = `${this.url}/delete/${id}`;
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
