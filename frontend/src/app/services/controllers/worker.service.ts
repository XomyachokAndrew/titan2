import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IWorker } from '../models/Worker';
import { environment } from '../../../environments/environment';
import { IStatusWorkerDto, IWorkerDto } from '../models/DTO';
import { IWorkerDetail } from '../models/WorkerDetail';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = `${environment.apiUrl}/workers`;

  constructor(private http: HttpClient) { }

  // GET: api/workers
  getWorkers(): Observable<IWorkerDetail[]> {
    return this.http.get<IWorkerDetail[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET: api/workers/{id}
  getWorker(id: number): Observable<IWorkerDetail> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IWorkerDetail>(url)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workers/update/{id}
  updateWorker(id: number, workerDto: IWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/update/${id}`;
    return this.http.put(url, workerDto)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workers/status/add
  addStatusWorker(statusWorkerDto: IStatusWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/status/add`;
    return this.http.post(url, statusWorkerDto)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workers/update-end-date/{id}
  updateEndDate(id: number, endDate?: string): Observable<any> {
    const url = `${this.apiUrl}/update-end-date/${id}`;
    return this.http.put(url, { endDate })
      .pipe(catchError(this.handleError));
  }

  // PUT: api/workers/status/update/{id}
  updateStatus(id: number, updatedStatusDto: IStatusWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/status/update/${id}`;
    return this.http.put(url, updatedStatusDto)
      .pipe(catchError(this.handleError));
  }

  // POST: api/workers/add
  addWorker(workerDto: IWorkerDto): Observable<any> {
    const url = `${this.apiUrl}/add`;
    return this.http.post(url, workerDto)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/workers/{id}
  deleteWorker(id: number): Observable<any> {
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
