import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { IOffice } from '../models/Office';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private apiUrl = `${environment.apiUrl}/Offices`;

  constructor(private http: HttpClient) { }

  getOffices(): Observable<IOffice[]> {
    return this.http.get<IOffice[]>(this.apiUrl);
  }
  
  getOfficesById(id: number): Observable<IOffice> {
    return this.http.get<IOffice>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<IOffice>(`getPost id=${id}`))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
