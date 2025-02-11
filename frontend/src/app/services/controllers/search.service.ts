import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = "http://localhost:8080/api/search";

  constructor(private http: HttpClient) { }

  // Поиск по запросу
  searchOffices(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);

    return this.http.get<any>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError<any>('searchOffices'))
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
