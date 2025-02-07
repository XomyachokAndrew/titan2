import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Floor } from './models/Floor';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private apiUrl = "http://localhost:8080/api/floors";

  constructor(private http: HttpClient) { }

  // Получение этажей по ID офиса
  getFloorsByOfficeId(id: number): Observable<Floor[]> {
    const url = `${this.apiUrl}/office/${id}`;
    return this.http.get<Floor[]>(url)
      .pipe(
        catchError(this.handleError<Floor[]>('getFloorsByOfficeId', []))
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
