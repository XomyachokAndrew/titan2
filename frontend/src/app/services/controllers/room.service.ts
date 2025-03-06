import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IRoom } from '../models/Room';
import { environment } from '../../../environments/environment';
import { IRoomDto } from '../models/DTO';

/**
 * Сервис для работы с комнатами.
 * Предоставляет методы для получения, создания, обновления и удаления комнат.
 */
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private url = `${environment.apiUrl}/rooms`;

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {}

  /**
   * Получает список комнат по идентификатору этажа.
   *
   * @param id - Идентификатор этажа.
   * @returns Observable, который возвращает массив комнат.
   */
  getRoomsByFloorId(id: number): Observable<IRoom[]> {
    const url = `${this.url}/floor/${id}`;
    return this.http.get<IRoom[]>(url).pipe(catchError(this.handleError));
  }

  /**
   * Получает список всех комнат.
   *
   * @returns Observable, который возвращает массив комнат.
   */
  getRooms(): Observable<IRoom[]> {
    return this.http.get<IRoom[]>(this.url).pipe(catchError(this.handleError));
  }

  /**
   * Получает информацию о комнате по её идентификатору.
   *
   * @param id - Идентификатор комнаты.
   * @returns Observable, который возвращает информацию о комнате.
   */
  getRoom(id: number): Observable<IRoomDto> {
    const url = `${this.url}/${id}`;
    return this.http.get<IRoomDto>(url).pipe(catchError(this.handleError));
  }

  /**
   * Обновляет информацию о комнате по её идентификатору.
   *
   * @param id - Идентификатор комнаты.
   * @param room - Обновленные данные комнаты.
   * @returns Observable, который возвращает результат обновления.
   */
  updateRoom(id: number, room: IRoom): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.put(url, room).pipe(catchError(this.handleError));
  }

  /**
   * Создает новую комнату.
   *
   * @param room - Данные новой комнаты.
   * @returns Observable, который возвращает созданную комнату.
   */
  createRoom(room: IRoom): Observable<IRoom> {
    return this.http
      .post<IRoom>(this.url, room)
      .pipe(catchError(this.handleError));
  }

  /**
   * Удаляет комнату по её идентификатору.
   *
   * @param id - Идентификатор комнаты.
   * @returns Observable, который возвращает результат удаления.
   */
  deleteRoom(id: number): Observable<any> {
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
