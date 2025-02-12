import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorkersStatusesType } from '../models/WorkersStatusesType';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkersStatusesTypeService {
  private apiUrl = `${environment.apiUrl}/WorkspaceStatusesType`;

  constructor(private http: HttpClient) { }

  getWorkersStatusesTypes(): Observable<IWorkersStatusesType[]> {
    return this.http.get<IWorkersStatusesType[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<IWorkersStatusesType[]>('getWorkersStatusesTypes', []))
      );
  }

  getWorkersStatusesType(id: number): Observable<IWorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IWorkersStatusesType>(url)
      .pipe(
        catchError(this.handleError<IWorkersStatusesType>(`getWorkersStatusesType id=${id}`))
      );
  }

  updateWorkersStatusesType(workersStatusesType: IWorkersStatusesType): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, workersStatusesType, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateWorkersStatusesType'))
      );
  }

  addWorkersStatusesType(workersStatusesType: IWorkersStatusesType): Observable<IWorkersStatusesType> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<IWorkersStatusesType>(this.apiUrl, workersStatusesType, httpOptions)
      .pipe(
        catchError(this.handleError<IWorkersStatusesType>('addWorkersStatusesType'))
      );
  }

  deleteWorkersStatusesType(id: number): Observable<IWorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<IWorkersStatusesType>(url, httpOptions)
      .pipe(
        catchError(this.handleError<IWorkersStatusesType>('deleteWorkersStatusesType'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
