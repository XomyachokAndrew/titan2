import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICurrentWorkspace } from '../models/CurrentWorkspace';
import { IWorkspaceInfoDto, IStatusWorkspaceDto, IWorkspaceDto } from '../models/DTO';
import { environment } from '../../../environments/environment';
import { IHistoryWorkspaceStatus } from '../models/HistoryWorkspaceStatus';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private baseUrl = `${environment.apiUrl}/workspace`;

  constructor(private http: HttpClient) { }

  getWorkspacesByRoom(roomId: number): Observable<ICurrentWorkspace[]> {
    return this.http.get<ICurrentWorkspace[]>(`${this.baseUrl}/room/${roomId}`)
      .pipe(
        catchError(this.handleError<ICurrentWorkspace[]>('getWorkspacesByRoom', []))
      );
  }

  getWorkspaceInfo(id: number): Observable<IWorkspaceInfoDto> {
    return this.http.get<IWorkspaceInfoDto>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<IWorkspaceInfoDto>('getWorkspaceInfo'))
      );
  }

  getWorkspaceHistory(id: number): Observable<IHistoryWorkspaceStatus[]> {
    return this.http.get<IHistoryWorkspaceStatus[]>(`${this.baseUrl}/${id}/history`)
      .pipe(
        catchError(this.handleError<IHistoryWorkspaceStatus[]>('getWorkspaceHistory', []))
      );
  }

  addStatusWorkspace(statusWorkspaceDto: IStatusWorkspaceDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Create/Status`, statusWorkspaceDto)
      .pipe(
        catchError(this.handleError<void>('addStatusWorkspace'))
      );
  }

  updateEndDate(id: number, endDate?: Date): Observable<void> {
    const url = `${this.baseUrl}/${id}/end-date`;
    const body = endDate ? { endDate } : {};
    return this.http
      .put<void>(url, body)
      .pipe(catchError(this.handleError<void>('updateEndDate')));
  }

  updateStatus(id: number, updatedStatusDto: IStatusWorkspaceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, updatedStatusDto)
      .pipe(
        catchError(this.handleError<void>('updateStatus'))
      );
  }

  createWorkspace(workspaceDto: IWorkspaceDto): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/create`, workspaceDto)
      .pipe(catchError(this.handleError<void>('createWorkspace')));
  }

  deleteWorkspace(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError<void>('deleteWorkspace')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
