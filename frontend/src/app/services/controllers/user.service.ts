import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserLoginDto, UserRegistrationDto, RefreshTokenDto } from '../models/DTO';
import { LoginResponse } from '../response';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:8080/api/user";
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  // Авторизация пользователя
  login(loginDto: UserLoginDto): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginDto)
      .pipe(
        tap(response => {
          console.log(response.token);
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(this.handleError<LoginResponse>('login'))
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Регистрация пользователя
  register(registrationDto: UserRegistrationDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registrationDto)
      .pipe(
        catchError(this.handleError<any>('register'))
      );
  }

  // Обновление токена
  refreshToken(refreshTokenDto: RefreshTokenDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-token`, refreshTokenDto)
      .pipe(
        catchError(this.handleError<any>('refreshToken'))
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
