import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IRoom } from '../models/Room';
import { environment } from '../../../environments/environment';
import { IRoomDto } from '../models/DTO';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private url = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) { }

  // GET: api/rooms/floor/{id}
  getRoomsByFloorId(id: number): Observable<IRoom[]> {
    const url = `${this.url}/floor/${id}`;
    return this.http.get<IRoom[]>(url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/rooms
  getRooms(): Observable<IRoom[]> {
    return this.http.get<IRoom[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/rooms/{id}
  getRoom(id: number): Observable<IRoomDto> {
    const url = `${this.url}/${id}`;
    return this.http.get<IRoomDto>(url)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/rooms/{id}
  updateRoom(id: number, room: IRoom): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.put(url, room)
      .pipe(catchError(this.handleError));
  }

  // POST: api/rooms
  createRoom(room: IRoom): Observable<IRoom> {
    return this.http.post<IRoom>(this.url, room)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/rooms/{id}
  deleteRoom(id: number): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.delete(url)
      .pipe(catchError(this.handleError));
  }

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
