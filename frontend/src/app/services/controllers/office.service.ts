import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IOfficeDto } from '../models/DTO';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private apiUrl = `${environment.apiUrl}/Offices`;

  constructor(private http: HttpClient) { }

  getOffices(): Observable<IOfficeDto[]> {
    return this.http.get<IOfficeDto[]>(this.apiUrl);
  }
  
  getOfficesById(id: number): Observable<IOfficeDto> {
    return this.http.get<IOfficeDto>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError<IOfficeDto>(`getPost id=${id}`))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
