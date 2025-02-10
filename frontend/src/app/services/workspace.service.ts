import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CurrentWorkspace } from './models/CurrentWorkspace';
import { WorkspaceInfoDto, StatusWorkspaceDto } from './models/DTO';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private baseUrl = 'api/workspaces'; // Adjust the base URL as needed

  constructor(private http: HttpClient) { }

  // GET: api/workspaces/room/{roomId}
  getWorkspacesByRoom(roomId: number): Observable<CurrentWorkspace[]> {
    return this.http.get<CurrentWorkspace[]>(`${this.baseUrl}/room/${roomId}`)
      .pipe(
        catchError(this.handleError<CurrentWorkspace[]>('getWorkspacesByRoom', []))
      );
  }

  // GET: api/workspaces/{id}
  getWorkspaceInfo(id: number): Observable<WorkspaceInfoDto> {
    return this.http.get<WorkspaceInfoDto>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError<WorkspaceInfoDto>('getWorkspaceInfo'))
      );
  }

  // GET: api/workspaces/{id}/history
  getWorkspaceHistory(id: number): Observable<StatusWorkspaceDto[]> {
    return this.http.get<StatusWorkspaceDto[]>(`${this.baseUrl}/${id}/history`)
      .pipe(
        catchError(this.handleError<StatusWorkspaceDto[]>('getWorkspaceHistory', []))
      );
  }

  // POST: api/workspaces
  addStatusWorkspace(statusWorkspaceDto: StatusWorkspaceDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, statusWorkspaceDto)
      .pipe(
        catchError(this.handleError<void>('addStatusWorkspace'))
      );
  }

  // PUT: api/workspaces/{id}/end-date
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

  // PUT: api/workspaces/{id}
  updateStatus(id: number, updatedStatusDto: StatusWorkspaceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, updatedStatusDto)
      .pipe(
        catchError(this.handleError<void>('updateStatus'))
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
