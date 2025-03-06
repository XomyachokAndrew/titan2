import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  IUserLoginDto,
  IUserRegistrationDto,
  IRefreshTokenDto,
} from '../models/DTO';
import { ILoginResponse } from '../response';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

/**
 * Сервис для управления аутентификацией пользователя.
 * Предоставляет методы для входа, регистрации, обновления токена, проверки аутентификации и роли пользователя.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = `${environment.apiUrl}/user`;
  private isAuthenticatedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable();

  /**
   * Конструктор сервиса.
   *
   * @param http - Сервис для выполнения HTTP-запросов.
   */
  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  /**
   * Выполняет вход пользователя.
   *
   * @param loginDto - Данные для входа.
   * @returns Observable, который возвращает результат входа.
   */
  login(loginDto: IUserLoginDto): Observable<any> {
    return this.http.post<ILoginResponse>(`${this.url}/login`, loginDto).pipe(
      tap(response => {
        console.log(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError<ILoginResponse>('login'))
    );
  }

  /**
   * Возвращает токен аутентификации.
   *
   * @returns Токен аутентификации или null, если токен отсутствует.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Возвращает роль пользователя.
   *
   * @returns Роль пользователя или null, если токен отсутствует или не содержит роли.
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role; // Предположим, что роль хранится в поле 'role'
    }
    return null;
  }

  /**
   * Проверяет, является ли пользователь администратором.
   *
   * @returns True, если пользователь является администратором, иначе false.
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  /**
   * Выполняет выход пользователя.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Проверяет, аутентифицирован ли пользователь.
   *
   * @returns True, если пользователь аутентифицирован, иначе false.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Регистрирует нового пользователя.
   *
   * @param registrationDto - Данные для регистрации.
   * @returns Observable, который возвращает результат регистрации.
   */
  register(registrationDto: IUserRegistrationDto): Observable<any> {
    return this.http
      .post(`${this.url}/register`, registrationDto)
      .pipe(catchError(this.handleError<any>('register')));
  }

  /**
   * Обновляет токен аутентификации.
   *
   * @param refreshTokenDto - Данные для обновления токена.
   * @returns Observable, который возвращает результат обновления токена.
   */
  refreshToken(refreshTokenDto: IRefreshTokenDto): Observable<any> {
    return this.http
      .post(`${this.url}/refresh-token`, refreshTokenDto)
      .pipe(catchError(this.handleError<any>('refreshToken')));
  }

  /**
   * Обработчик ошибок для HTTP-запросов.
   *
   * @param operation - Название операции, в которой произошла ошибка.
   * @param result - Результат операции (опционально).
   * @returns Observable, который возвращает сообщение об ошибке.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
