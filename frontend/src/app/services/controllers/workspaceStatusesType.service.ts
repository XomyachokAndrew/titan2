import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkspaceStatusesType } from '../models/WorkspaceStatusesType';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStatusesTypeService {
  private url = `${environment.apiUrl}/WorkspaceStatusesTypes`;

  constructor(private http: HttpClient) { }

  // GET: api/workspacestatusestypes
  getWorkspaceStatusesTypes(): Observable<IWorkspaceStatusesType[]> {
    return this.http.get<IWorkspaceStatusesType[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/workspacestatusestypes/{id}
  getWorkspaceStatusesType(id: number): Observable<IWorkspaceStatusesType> {
    const url = `${this.url}/${id}`;
    return this.http.get<IWorkspaceStatusesType>(url)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workspacestatusestypes/{id}
  updateWorkspaceStatusesType(id: number, workspaceStatusesType: IWorkspaceStatusesType): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.put(url, workspaceStatusesType)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workspacestatusestypes
  createWorkspaceStatusesType(workspaceStatusesType: IWorkspaceStatusesType): Observable<IWorkspaceStatusesType> {
    return this.http.post<IWorkspaceStatusesType>(this.url, workspaceStatusesType)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/workspacestatusestypes/{id}
  deleteWorkspaceStatusesType(id: number): Observable<any> {
    const url = `${this.url}/${id}`;
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
