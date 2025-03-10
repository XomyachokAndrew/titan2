import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPost } from '../models/Post';
import { environment } from '../../../environments/environment';

/**
 * Сервис для работы с должностями.
 * Предоставляет методы для получения, создания, обновления и удаления должностей.
 */
@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

    /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) { }

    /**
   * Получает список всех должностей.
   *
   * @returns Observable, который возвращает массив должностей.
   */
  getPosts(): Observable<IPost[]> {
    return this.http.get<IPost[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

    /**
   * Получает информацию о должности по её идентификатору.
   *
   * @param id - Идентификатор должности.
   * @returns Observable, который возвращает информацию о должности.
   */
  getPost(id: number): Observable<IPost> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPost>(url)
      .pipe(catchError(this.handleError));
  }

  import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPost } from '../models/Post';
import { environment } from '../../../environments/environment';

/**
 * Сервис для работы с должностями.
 * Предоставляет методы для получения, создания, обновления и удаления должностей.
 */
@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) { }

  /**
   * Получает список всех должностей.
   *
   * @returns Observable, который возвращает массив должностей.
   */
  getPosts(): Observable<IPost[]> {
    return this.http.get<IPost[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о должности по её идентификатору.
   *
   * @param id - Идентификатор должности.
   * @returns Observable, который возвращает информацию о должности.
   */
  getPost(id: number): Observable<IPost> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPost>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Обновляет информацию о должности по её идентификатору.
   *
   * @param id - Идентификатор должности.
   * @param post - Обновленные данные должности.
   * @returns Observable, который возвращает результат обновления.
   */
  updatePost(id: number, post: IPost): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, post)
      .pipe(catchError(this.handleError));
  }

    /**
   * Создает новую должность.
   *
   * @param post - Данные новой должности.
   * @returns Observable, который возвращает созданную должность.
   */
  createPost(post: IPost): Observable<IPost> {
    return this.http.post<IPost>(this.apiUrl, post)
      .pipe(catchError(this.handleError));
  }

  /**
   * Удаляет должность по её идентификатору.
   *
   * @param id - Идентификатор должности.
   * @returns Observable, который возвращает результат удаления.
   */
  deletePost(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url)
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
