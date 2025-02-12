import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkspaceStatusesType } from '../models/WorkspaceStatusesType';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStatusesTypeService {
  private baseUrl = `${environment.apiUrl}/WorkspaceStatusesTypes`;

  constructor(private http: HttpClient) { }

  getWorkspaceStatusesTypes(): Observable<IWorkspaceStatusesType[]> {
    return this.http.get<IWorkspaceStatusesType[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError<IWorkspaceStatusesType[]>('getWorkspaceStatusesTypes', []))
      );
  }

  getWorkspaceStatusesType(id: number): Observable<IWorkspaceStatusesType> {
    return this.http.get<IWorkspaceStatusesType>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<IWorkspaceStatusesType>('getWorkspaceStatusesType'))
      );
  }

  updateWorkspaceStatusesType(id: number, workspaceStatusesType: IWorkspaceStatusesType): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, workspaceStatusesType)
      .pipe(
        catchError(this.handleError<void>('updateWorkspaceStatusesType'))
      );
  }

  addWorkspaceStatusesType(workspaceStatusesType: IWorkspaceStatusesType): Observable<IWorkspaceStatusesType> {
    return this.http.post<IWorkspaceStatusesType>(this.baseUrl, workspaceStatusesType)
      .pipe(
        catchError(this.handleError<IWorkspaceStatusesType>('addWorkspaceStatusesType'))
      );
  }

  deleteWorkspaceStatusesType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteWorkspaceStatusesType'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
