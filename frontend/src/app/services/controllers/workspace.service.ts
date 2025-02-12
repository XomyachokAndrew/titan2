import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICurrentWorkspace } from '../models/CurrentWorkspace';
import { IWorkspaceInfoDto, IStatusWorkspaceDto } from '../models/DTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private baseUrl = `${environment.apiUrl}/workspaces`;

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

  getWorkspaceHistory(id: number): Observable<IStatusWorkspaceDto[]> {
    return this.http.get<IStatusWorkspaceDto[]>(`${this.baseUrl}/${id}/history`)
      .pipe(
        catchError(this.handleError<IStatusWorkspaceDto[]>('getWorkspaceHistory', []))
      );
  }

  addStatusWorkspace(statusWorkspaceDto: IStatusWorkspaceDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, statusWorkspaceDto)
      .pipe(
        catchError(this.handleError<void>('addStatusWorkspace'))
      );
  }

  updateEndDate(id: number, endDate?: string): Observable<void> {
    let params = new HttpParams();
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return this.http.put<void>(`${this.baseUrl}/${id}/end-date`, {}, { params })
      .pipe(
        catchError(this.handleError<void>('updateEndDate'))
      );
  }

  updateStatus(id: number, updatedStatusDto: IStatusWorkspaceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, updatedStatusDto)
      .pipe(
        catchError(this.handleError<void>('updateStatus'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
