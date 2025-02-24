import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IUserLoginDto, IUserRegistrationDto, IRefreshTokenDto } from '../models/DTO';
import { ILoginResponse } from '../response';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = `${environment.apiUrl}/user`;
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(loginDto: IUserLoginDto): Observable<any> {
    return this.http.post<ILoginResponse>(`${this.url}/login`, loginDto)
      .pipe(
        tap(response => {
          console.log(response.token);
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(this.handleError<ILoginResponse>('login'))
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

  register(registrationDto: IUserRegistrationDto): Observable<any> {
    return this.http.post(`${this.url}/register`, registrationDto)
      .pipe(
        catchError(this.handleError<any>('register'))
      );
  }

  refreshToken(refreshTokenDto: IRefreshTokenDto): Observable<any> {
    return this.http.post(`${this.url}/refresh-token`, refreshTokenDto)
      .pipe(
        catchError(this.handleError<any>('refreshToken'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      throw error.message;
    };
  }
}
