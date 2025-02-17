import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IFloorDto } from '../models/DTO';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private apiUrl = `${environment.apiUrl}/floors`;

  constructor(private http: HttpClient) { }

  getFloorsByOfficeId(id: number): Observable<IFloorDto[]> {
    const url = `${this.apiUrl}/office/${id}`;
    return this.http.get<IFloorDto[]>(url)
      .pipe(
        catchError(this.handleError<IFloorDto[]>('getFloorsByOfficeId', []))
      );
  }

  getFloorById(id: number): Observable<IFloorDto> {
    return this.http.get<IFloorDto>(`${this.apiUrl}/${id}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
