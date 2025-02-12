import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPost } from '../models/Post';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/post`;

  constructor(private http: HttpClient) { }

  getPosts(): Observable<IPost[]> {
    return this.http.get<IPost[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<IPost[]>('getPosts', []))
      );
  }

  getPost(id: number): Observable<IPost> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPost>(url)
      .pipe(
        catchError(this.handleError<IPost>(`getPost id=${id}`))
      );
  }

  updatePost(post: IPost): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, post, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updatePost'))
      );
  }

  addPost(post: IPost): Observable<IPost> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<IPost>(this.apiUrl, post, httpOptions)
      .pipe(
        catchError(this.handleError<IPost>('addPost'))
      );
  }

  deletePost(id: number): Observable<IPost> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<IPost>(url, httpOptions)
      .pipe(
        catchError(this.handleError<IPost>('deletePost'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
