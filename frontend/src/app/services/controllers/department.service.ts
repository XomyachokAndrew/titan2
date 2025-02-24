import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IDepartment } from '../models/Department';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private url = `${environment.apiUrl}/Departments`;

  constructor(private http: HttpClient) { }

  // GET: api/departments
  getDepartments(): Observable<IDepartment[]> {
    return this.http.get<IDepartment[]>(this.url)
      .pipe(catchError(this.handleError));
  }

  // GET: api/departments/5
  getDepartment(id: number): Observable<IDepartment> {
    const url = `${this.url}/${id}`;
    return this.http.get<IDepartment>(url)
      .pipe(catchError(this.handleError));
  }

  // POST: api/departments
  addDepartment(department: IDepartment): Observable<IDepartment> {
    return this.http.post<IDepartment>(this.url, department)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/departments/5
  updateDepartment(id: number, department: IDepartment): Observable<any> {
    const url = `${this.url}/${id}`;
    return this.http.put(url, department)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/departments/5
  deleteDepartment(id: number): Observable<any> {
    const url = `${this.url}/${id}`;
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
    // Возвращаем ошибку в виде Observable
    return throwError(() => new Error(errorMessage));
  }
}
