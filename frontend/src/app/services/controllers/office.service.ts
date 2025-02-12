import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Office } from '../models/Office';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private apiUrl = "http://localhost:8080/api/Offices";

  constructor(private http: HttpClient) { }

  // Получение списка офисов
  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(this.apiUrl);
  }
  
  getOfficesById(id: number): Observable<Office> {
    return this.http.get<Office>(`${this.apiUrl}/${id}`);
  }
}
