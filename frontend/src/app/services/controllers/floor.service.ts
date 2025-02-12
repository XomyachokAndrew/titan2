import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IFloor } from '../models/Floor';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private apiUrl = `${environment.apiUrl}/floors`;

  constructor(private http: HttpClient) { }

  getFloorsByOfficeId(id: number): Observable<IFloor[]> {
    const url = `${this.apiUrl}/office/${id}`;
    return this.http.get<IFloor[]>(url)
      .pipe(
        catchError(this.handleError<IFloor[]>('getFloorsByOfficeId', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
