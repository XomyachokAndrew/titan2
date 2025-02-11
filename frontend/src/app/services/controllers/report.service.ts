import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = "http://localhost:8080/api/report";

  constructor(private http: HttpClient) { }

  // Получение отчета о стоимости аренды
  getRentalCost(officeId: number, reportTypeId: number, idUser: number): Observable<Blob> {
    const params = new HttpParams()
      .set('officeId', officeId.toString())
      .set('reportTypeId', reportTypeId.toString())
      .set('idUser', idUser.toString());

    const headers = new HttpHeaders().set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return this.http.get<Blob>(`${this.apiUrl}/${reportTypeId}/${officeId}`, { params, headers, responseType: 'blob' as 'json' })
      .pipe(
        catchError(this.handleError<Blob>('getRentalCost'))
      );
  }

  // Обработка ошибок
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
