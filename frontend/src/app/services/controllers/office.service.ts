import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOffice } from '../models/Office';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  private apiUrl = `${environment.apiUrl}/Offices`;

  constructor(private http: HttpClient) { }

  getOffices(): Observable<IOffice[]> {
    return this.http.get<IOffice[]>(this.apiUrl);
  }
  
  getOfficesById(id: number): Observable<IOffice> {
    return this.http.get<IOffice>(`${this.apiUrl}/${id}`);
  }
}
