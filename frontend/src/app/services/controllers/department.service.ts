import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IDepartment } from '../models/Department';
import { environment } from '../../../environments/environment';

/**
 * Сервис для работы с отделами.
 * Предоставляет методы для получения, добавления, обновления и удаления отделов.
 */
@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private url = `${environment.apiUrl}/Departments`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список всех отделов.
   *
   * @returns Observable, который возвращает массив отделов.
   */
  getDepartments(): Observable<IDepartment[]> {
    return this.http
      .get<IDepartment[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает отдел по его идентификатору.
   *
   * @param id - Идентификатор отдела.
   * @returns Observable, который возвращает отдел.
   */
  getDepartment(id: number): Observable<IDepartment> {
    const url = `${this.url}/${id}`;
    return this.http.get<IDepartment>(url).pipe(catchError(this.handleError));
  }

  /**
   * Добавляет новый отдел.
   *
   * @param department - Данные нового отдела.
   * @returns Observable, который возвращает добавленный отдел.
   */
  addDepartment(department: IDepartment): Observable<IDepartment> {
    return this.http
      .post<IDepartment>(this.url, department)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет данные отдела по его идентификатору.
   *
   * @param id - Идентификатор отдела.
   * @param department - Обновленные данные отдела.
   * @returns Observable, который возвращает результат обновления.
   */
  updateDepartment(id: number, department: IDepartment): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.put(url, department).pipe(catchError(this.handleError));
  }

  /**
   * Удаляет отдел по его идентификатору.
   *
   * @param id - Идентификатор отдела.
   * @returns Observable, который возвращает результат удаления.
   */
  deleteDepartment(id: number): Observable<any> {
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
    // Возвращаем ошибку в виде Observable
    return throwError(() => new Error(errorMessage));
  }
}
