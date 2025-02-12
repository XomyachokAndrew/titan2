import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IDepartment } from '../models/Department';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private url = `${environment.apiUrl}/Departments`;

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<IDepartment[]> {
    return this.http.get<IDepartment[]>(this.url)
      .pipe(
        catchError(this.handleError<IDepartment[]>('getDepartments', []))
      );
  }

  getDepartment(id: number): Observable<IDepartment> {
    const url = `${this.url}/${id}`;
    return this.http.get<IDepartment>(url)
      .pipe(
        catchError(this.handleError<IDepartment>(`getDepartment id=${id}`))
      );
  }

  updateDepartment(department: IDepartment): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.url, department, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updateDepartment'))
      );
  }

  addDepartment(department: IDepartment): Observable<IDepartment> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<IDepartment>(this.url, department, httpOptions)
      .pipe(
        catchError(this.handleError<IDepartment>('addDepartment'))
      );
  }

  deleteDepartment(id: number): Observable<IDepartment> {
    const url = `${this.url}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<IDepartment>(url, httpOptions)
      .pipe(
        catchError(this.handleError<IDepartment>('deleteDepartment'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
