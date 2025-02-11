import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Worker } from '../models/Worker';


@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = "http://localhost:8080/api/worker";

  constructor(private http: HttpClient) { }

  // Получение списка работников
  getWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Worker[]>('getWorkers', []))
      );
  }

  // Получение работника по ID
  getWorker(id: number): Observable<Worker> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Worker>(url)
      .pipe(
        catchError(this.handleError<Worker>(`getWorker id=${id}`))
      );
  }

  // Обновление работника
  updateWorker(worker: Worker): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, worker, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateWorker'))
      );
  }

  // Добавление нового работника
  addWorker(worker: Worker): Observable<Worker> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<Worker>(this.apiUrl, worker, httpOptions)
      .pipe(
        catchError(this.handleError<Worker>('addWorker'))
      );
  }

  // Удаление работника
  deleteWorker(id: number): Observable<Worker> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<Worker>(url, httpOptions)
      .pipe(
        catchError(this.handleError<Worker>('deleteWorker'))
      );
  }

  // Обработка ошибок
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
