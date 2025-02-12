import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post } from '../models/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = "http://localhost:8080/api/post";

  constructor(private http: HttpClient) { }

  // Получение списка постов
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Post[]>('getPosts', []))
      );
  }

  // Получение поста по ID
  getPost(id: number): Observable<Post> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Post>(url)
      .pipe(
        catchError(this.handleError<Post>(`getPost id=${id}`))
      );
  }

  // Обновление поста
  updatePost(post: Post): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.apiUrl, post, httpOptions)
      .pipe(
        catchError(this.handleError<any>('updatePost'))
      );
  }

  // Добавление нового поста
  addPost(post: Post): Observable<Post> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<Post>(this.apiUrl, post, httpOptions)
      .pipe(
        catchError(this.handleError<Post>('addPost'))
      );
  }

  // Удаление поста
  deletePost(id: number): Observable<Post> {
    const url = `${this.apiUrl}/${id}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.delete<Post>(url, httpOptions)
      .pipe(
        catchError(this.handleError<Post>('deletePost'))
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
