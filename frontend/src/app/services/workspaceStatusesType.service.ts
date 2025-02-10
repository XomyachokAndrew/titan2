import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkspaceStatusesType } from './models/WorkspaceStatusesType';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStatusesTypeService {
  private baseUrl = 'api/WorkspaceStatusesTypes'; // Adjust the base URL as needed

  constructor(private http: HttpClient) { }

  // GET: api/WorkspaceStatusesTypes
  getWorkspaceStatusesTypes(): Observable<WorkspaceStatusesType[]> {
    return this.http.get<WorkspaceStatusesType[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError<WorkspaceStatusesType[]>('getWorkspaceStatusesTypes', []))
      );
  }

  // GET: api/WorkspaceStatusesTypes/5
  getWorkspaceStatusesType(id: number): Observable<WorkspaceStatusesType> {
    return this.http.get<WorkspaceStatusesType>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<WorkspaceStatusesType>('getWorkspaceStatusesType'))
      );
  }

  // PUT: api/WorkspaceStatusesTypes/5
  updateWorkspaceStatusesType(id: number, workspaceStatusesType: WorkspaceStatusesType): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, workspaceStatusesType)
      .pipe(
        catchError(this.handleError<void>('updateWorkspaceStatusesType'))
      );
  }

  // POST: api/WorkspaceStatusesTypes
  addWorkspaceStatusesType(workspaceStatusesType: WorkspaceStatusesType): Observable<WorkspaceStatusesType> {
    return this.http.post<WorkspaceStatusesType>(this.baseUrl, workspaceStatusesType)
      .pipe(
        catchError(this.handleError<WorkspaceStatusesType>('addWorkspaceStatusesType'))
      );
  }

  // DELETE: api/WorkspaceStatusesTypes/5
  deleteWorkspaceStatusesType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteWorkspaceStatusesType'))
      );
  }

  // Обработка ошибок
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      throw error.message;
    };
  }
}
