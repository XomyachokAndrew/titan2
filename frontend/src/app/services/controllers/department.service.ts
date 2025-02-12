import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Department } from '../models/Department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = "http://localhost:8080/api/Departments";

  constructor(private http: HttpClient) { }

  // Получение списка всех департаментов
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Department[]>('getDepartments', []))
      );
  }

  // Получение департамента по ID
  getDepartment(id: number): Observable<Department> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Department>(url)
      .pipe(
        catchError(this.handleError<Department>(`getDepartment id=${id}`))
      );
  }

  // Обновление департамента
  updateDepartment(department: Department): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, department, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateDepartment'))
      );
  }

  // Добавление нового департамента
  addDepartment(department: Department): Observable<Department> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<Department>(this.apiUrl, department, httpOptions)
      .pipe(
        catchError(this.handleError<Department>('addDepartment'))
      );
  }

  // Удаление департамента
  deleteDepartment(id: number): Observable<Department> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<Department>(url, httpOptions)
      .pipe(
        catchError(this.handleError<Department>('deleteDepartment'))
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
