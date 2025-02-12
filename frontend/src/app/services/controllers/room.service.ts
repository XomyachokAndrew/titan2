import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IRoom } from '../models/Room';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) { }

   getRoomsByFloorId(id: number): Observable<IRoom[]> {
    const url = `${this.apiUrl}/floor/${id}`;
    return this.http.get<IRoom[]>(url)
      .pipe(
        catchError(this.handleError<IRoom[]>('getRoomsByFloorId', []))
      );
  }

  getRooms(): Observable<IRoom[]> {
    return this.http.get<IRoom[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<IRoom[]>('getRooms', []))
      );
  }

  getRoom(id: number): Observable<IRoom> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IRoom>(url)
      .pipe(
        catchError(this.handleError<IRoom>(`getRoom id=${id}`))
      );
  }

  updateRoom(room: IRoom): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, room, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateRoom'))
      );
  }

  addRoom(room: IRoom): Observable<IRoom> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<IRoom>(this.apiUrl, room, httpOptions)
      .pipe(
        catchError(this.handleError<IRoom>('addRoom'))
      );
  }

  deleteRoom(id: number): Observable<IRoom> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<IRoom>(url, httpOptions)
      .pipe(
        catchError(this.handleError<IRoom>('deleteRoom'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
