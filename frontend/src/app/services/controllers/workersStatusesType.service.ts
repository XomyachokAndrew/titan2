import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkersStatusesType } from '../models/WorkersStatusesType';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkersStatusesTypeService {
  private apiUrl = `${environment.apiUrl}/WorkersStatusesTypes`;

  constructor(private http: HttpClient) { }

  // GET: api/workersstatestypes
  getWorkersStatusesTypes(): Observable<IWorkersStatusesType[]> {
    return this.http.get<IWorkersStatusesType[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET: api/workersstatestypes/{id}
  getWorkersStatusesType(id: number): Observable<IWorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IWorkersStatusesType>(url)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workersstatestypes/{id}
  updateWorkersStatusesType(id: number, workersStatusesType: IWorkersStatusesType): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, workersStatusesType)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workersstatestypes
  createWorkersStatusesType(workersStatusesType: IWorkersStatusesType): Observable<IWorkersStatusesType> {
    return this.http.post<IWorkersStatusesType>(this.apiUrl, workersStatusesType)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/workersstatestypes/{id}
  deleteWorkersStatusesType(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url)
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
