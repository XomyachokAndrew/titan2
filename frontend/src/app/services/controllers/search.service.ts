import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Сервис для выполнения поиска по офисам.
 * Предоставляет метод для поиска офисов по заданному запросу.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private url = `${environment.apiUrl}/search`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Выполняет поиск офисов по заданному запросу.
   *
   * @param query - Строка запроса для поиска.
   * @returns Observable, который возвращает результаты поиска.
   */
  searchOffices(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http
      .get<any>(this.url, { params })
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
