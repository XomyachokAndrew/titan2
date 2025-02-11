import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserLoginDto, UserRegistrationDto, RefreshTokenDto } from '../models/DTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:8080/api/user";

  constructor(private http: HttpClient) { }

  // Авторизация пользователя
  login(loginDto: UserLoginDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginDto)
      .pipe(
        catchError(this.handleError<any>('login'))
      );
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
      console.log(`${operation} failed: ${error.message}`);
      throw error.message;
    };
  }
}
