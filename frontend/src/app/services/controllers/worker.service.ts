import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorker } from '../models/Worker';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/worker`;

  constructor(private http: HttpClient) { }

  getWorkers(): Observable<IWorker[]> {
    return this.http.get<IWorker[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<IWorker[]>('getWorkers', []))
      );
  }

  getWorker(id: number): Observable<IWorker> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IWorker>(url)
      .pipe(
        catchError(this.handleError<IWorker>(`getWorker id=${id}`))
      );
  }

  updateWorker(worker: IWorker): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, worker, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateWorker'))
      );
  }

  addWorker(worker: IWorker): Observable<IWorker> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<IWorker>(this.apiUrl, worker, httpOptions)
      .pipe(
        catchError(this.handleError<IWorker>('addWorker'))
      );
  }

  deleteWorker(id: number): Observable<IWorker> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<IWorker>(url, httpOptions)
      .pipe(
        catchError(this.handleError<IWorker>('deleteWorker'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
