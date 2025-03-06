import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkspaceStatusesType } from '../models/WorkspaceStatusesType';
import { environment } from '../../../environments/environment';

/**
 * Сервис для работы с типами статусов рабочих пространств.
 * Предоставляет методы для получения, создания, обновления и удаления типов статусов рабочих пространств.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkspaceStatusesTypeService {
  private url = `${environment.apiUrl}/WorkspaceStatusesTypes`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список всех типов статусов рабочих пространств.
   *
   * @returns Observable, который возвращает массив типов статусов рабочих пространств.
   */
  getWorkspaceStatusesTypes(): Observable<IWorkspaceStatusesType[]> {
    return this.http
      .get<IWorkspaceStatusesType[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о типе статуса рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор типа статуса рабочего пространства.
   * @returns Observable, который возвращает информацию о типе статуса рабочего пространства.
   */
  getWorkspaceStatusesType(id: number): Observable<IWorkspaceStatusesType> {
    const url = `${this.url}/${id}`;
    return this.http
      .get<IWorkspaceStatusesType>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет информацию о типе статуса рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор типа статуса рабочего пространства.
   * @param workspaceStatusesType - Обновленные данные типа статуса рабочего пространства.
   * @returns Observable, который возвращает результат обновления.
   */
  updateWorkspaceStatusesType(
    id: number,
    workspaceStatusesType: IWorkspaceStatusesType
  ): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http
      .put(url, workspaceStatusesType)
      .pipe(catchError(this.handleError));
  }

  /**
   * Создает новый тип статуса рабочего пространства.
   *
   * @param workspaceStatusesType - Данные нового типа статуса рабочего пространства.
   * @returns Observable, который возвращает созданный тип статуса рабочего пространства.
   */
  createWorkspaceStatusesType(
    workspaceStatusesType: IWorkspaceStatusesType
  ): Observable<IWorkspaceStatusesType> {
    return this.http
      .post<IWorkspaceStatusesType>(this.url, workspaceStatusesType)
      .pipe(catchError(this.handleError));
  }

  /**
   * Удаляет тип статуса рабочего пространства по его идентификатору.
   *
   * @param id - Идентификатор типа статуса рабочего пространства.
   * @returns Observable, который возвращает результат удаления.
   */
  deleteWorkspaceStatusesType(id: number): Observable<any> {
    const url = `${this.url}/${id}`;
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
