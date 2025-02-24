import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IFloorDto } from '../models/DTO';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private url = `${environment.apiUrl}/floors`;

  constructor(private http: HttpClient) { }

  // GET: api/floors/office/{id}
  getFloorsByOfficeId(id: number): Observable<IFloorDto[]> {
    const url = `${this.url}/office/${id}`;
    return this.http.get<IFloorDto[]>(url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/floors/{id}
  getFloor(id: number): Observable<IFloorDto> {
    const url = `${this.url}/${id}`;
    return this.http.get<IFloorDto>(url)
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
