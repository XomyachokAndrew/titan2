import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IOfficeDto } from '../models/DTO';
import { IOffice } from '../models/Office';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private apiUrl = `${environment.apiUrl}/Offices`;

  constructor(private http: HttpClient) { }

  // GET: api/offices/{id}
  getOfficeById(id: number): Observable<IOffice> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IOffice>(url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/offices
  getOffices(): Observable<IOfficeDto[]> {
    return this.http.get<IOfficeDto[]>(this.apiUrl)
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
