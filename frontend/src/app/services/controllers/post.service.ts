import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPost } from '../models/Post';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) { }

  // GET: api/posts
  getPosts(): Observable<IPost[]> {
    return this.http.get<IPost[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // GET: api/posts/{id}
  getPost(id: number): Observable<IPost> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPost>(url)
      .pipe(catchError(this.handleError));
  }

  // PUT: api/posts/{id}
  updatePost(id: number, post: IPost): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, post)
      .pipe(catchError(this.handleError));
  }

  // POST: api/posts
  createPost(post: IPost): Observable<IPost> {
    return this.http.post<IPost>(this.apiUrl, post)
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/posts/{id}
  deletePost(id: number): Observable<any> {
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
