import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkersStatusesType } from '../models/WorkersStatusesType';

@Injectable({
  providedIn: 'root'
})
export class WorkersStatusesTypeService {
  private apiUrl = "http://localhost:8080/api/WorkspaceStatusesType";

  constructor(private http: HttpClient) { }

  // Получение списка типов статусов работников
  getWorkersStatusesTypes(): Observable<WorkersStatusesType[]> {
    return this.http.get<WorkersStatusesType[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<WorkersStatusesType[]>('getWorkersStatusesTypes', []))
      );
  }

  // Получение типа статуса работника по ID
  getWorkersStatusesType(id: number): Observable<WorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<WorkersStatusesType>(url)
      .pipe(
        catchError(this.handleError<WorkersStatusesType>(`getWorkersStatusesType id=${id}`))
      );
  }

  // Обновление типа статуса работника
  updateWorkersStatusesType(workersStatusesType: WorkersStatusesType): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, workersStatusesType, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateWorkersStatusesType'))
      );
  }

  // Добавление нового типа статуса работника
  addWorkersStatusesType(workersStatusesType: WorkersStatusesType): Observable<WorkersStatusesType> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<WorkersStatusesType>(this.apiUrl, workersStatusesType, httpOptions)
      .pipe(
        catchError(this.handleError<WorkersStatusesType>('addWorkersStatusesType'))
      );
  }

  // Удаление типа статуса работника
  deleteWorkersStatusesType(id: number): Observable<WorkersStatusesType> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<WorkersStatusesType>(url, httpOptions)
      .pipe(
        catchError(this.handleError<WorkersStatusesType>('deleteWorkersStatusesType'))
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
