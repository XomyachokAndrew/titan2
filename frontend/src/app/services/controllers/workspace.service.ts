import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICurrentWorkspace } from '../models/CurrentWorkspace';
import { IWorkspaceInfoDto, IStatusWorkspaceDto, IWorkspaceDto } from '../models/DTO';
import { environment } from '../../../environments/environment';
import { IHistoryWorkspaceStatus } from '../models/HistoryWorkspaceStatus';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private url = `${environment.apiUrl}/workspace`;

  constructor(private http: HttpClient) { }

  // GET: api/workspaces/room/{roomId}
  getWorkspacesByRoom(roomId: number): Observable<ICurrentWorkspace[]> {
    const url = `${this.url}/room/${roomId}`;
    return this.http.get<ICurrentWorkspace[]>(url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/workspaces/info/{id}
  getWorkspaceInfo(id: number): Observable<IWorkspaceInfoDto> {
    const url = `${this.url}/info/${id}`;
    return this.http.get<IWorkspaceInfoDto>(url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/workspaces/history/{id}
  getWorkspaceHistory(id: number): Observable<IHistoryWorkspaceStatus[]> {
    const url = `${this.url}/history/${id}`;
    return this.http.get<IHistoryWorkspaceStatus[]>(url)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workspaces/status/add
  addStatusWorkspace(statusWorkspaceDto: IStatusWorkspaceDto): Observable<any> {
    const url = `${this.url}/status/add`;
    return this.http.post(url, statusWorkspaceDto)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workspaces/update-end-date/{id}
  updateEndDate(id: number, endDate?: string): Observable<any> {
    const url = `${this.url}/update-end-date/${id}`;
    return this.http.put(url, { endDate })
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workspaces/UpdateStatus/{id}
  updateStatus(id: number, updatedStatusDto: IStatusWorkspaceDto): Observable<any> {
    const url = `${this.url}/UpdateStatus/${id}`;
    return this.http.put(url, updatedStatusDto)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workspaces/add
  addWorkspace(workspaceDto: IWorkspaceDto): Observable<any> {
    const url = `${this.url}/add`;
    return this.http.post(url, workspaceDto)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/workspaces/delete/{id}
  deleteWorkspace(id: number): Observable<any> {
    const url = `${this.url}/delete/${id}`;
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
