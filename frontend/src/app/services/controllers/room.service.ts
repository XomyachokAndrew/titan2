import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Room } from '../models/Room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = "http://localhost:8080/api/rooms";

  constructor(private http: HttpClient) { }

   // Получение комнат по ID этажа
   getRoomsByFloorId(id: number): Observable<Room[]> {
    const url = `${this.apiUrl}/floor/${id}`;
    return this.http.get<Room[]>(url)
      .pipe(
        catchError(this.handleError<Room[]>('getRoomsByFloorId', []))
      );
  }

  // Получение всех комнат
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Room[]>('getRooms', []))
      );
  }

  // Получение комнаты по ID
  getRoom(id: number): Observable<Room> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Room>(url)
      .pipe(
        catchError(this.handleError<Room>(`getRoom id=${id}`))
      );
  }

  // Обновление комнаты
  updateRoom(room: Room): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, room, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateRoom'))
      );
  }

  // Добавление новой комнаты
  addRoom(room: Room): Observable<Room> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<Room>(this.apiUrl, room, httpOptions)
      .pipe(
        catchError(this.handleError<Room>('addRoom'))
      );
  }

  // Удаление комнаты
  deleteRoom(id: number): Observable<Room> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<Room>(url, httpOptions)
      .pipe(
        catchError(this.handleError<Room>('deleteRoom'))
      );
  }

  // Обработка ошибок
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      throw error.message;
    };
  }
}
