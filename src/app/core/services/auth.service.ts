import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthTokens } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this._user.asObservable();

  get user(): User | null { return this._user.value; }
  get isLoggedIn(): boolean { return !!this.getAccessToken(); }
  get isClient(): boolean { return this.user?.role === 'client'; }
  get isPharmacist(): boolean { return this.user?.role === 'pharmacie'; }
  get isAdmin(): boolean { return this.user?.role === 'admin'; }

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${environment.apiUrl}/api/auth/login/`, { email, password }).pipe(
      tap(tokens => this.saveTokens(tokens))
    );
  }

  registerClient(data: object): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/api/accounts/register/client/`, data);
  }

  registerPharmacie(data: object): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/api/accounts/register/pharmacie/`, data);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    return this.http.post<{ access: string }>(`${environment.apiUrl}/api/auth/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem('access_token', res.access))
    );
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${environment.apiUrl}/api/auth/logout/`, { refresh }).subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._user.next(null);
    this.router.navigate(['/connexion']);
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/accounts/me/`).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this._user.next(user);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.fetchMe().subscribe();
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
