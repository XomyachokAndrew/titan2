import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private url = `${environment.apiUrl}/report`;

  constructor(private http: HttpClient) { }

  // GET: api/report/{reportTypeId}/{officeId}?idUser={idUser}
  getRentalCost(reportTypeId: number, officeId: number, idUser: number): Observable<Blob> {
    const resultUrl = `${this.url}/${reportTypeId}/${officeId}?idUser=${idUser}`;
    return this.http.get(resultUrl, { responseType: 'blob' })
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
