import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthTokens { access: string; refresh: string; role: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8000/api/users';
  private tokensKey = 'vitacare_tokens';

  private _tokens = new BehaviorSubject<AuthTokens | null>(this.storedTokens());
  currentUser$ = this._tokens.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get isLoggedIn() { return !!this._tokens.value; }
  get currentRole() { return this._tokens.value?.role ?? null; }
  get accessToken() { return this._tokens.value?.access ?? null; }

  private storedTokens(): AuthTokens | null {
    try { const r = localStorage.getItem(this.tokensKey); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }

  /** Patient login — POST /api/users/login/ */
  patientLogin(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/login/`, { email, password }).pipe(
      tap(tokens => this.store(tokens))
    );
  }

  /** Doctor login — POST /api/users/doctor/login/ */
  doctorLogin(email: string, password: string, license: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.base}/doctor/login/`, { email, password, license }).pipe(
      tap(tokens => this.store(tokens))
    );
  }

  /** Registration — POST /api/users/register/ */
  register(data: Record<string, string>): Observable<unknown> {
    return this.http.post(`${this.base}/register/`, data);
  }

  /** Token refresh — POST /api/users/token/refresh/ */
  refreshToken(): Observable<{ access: string }> {
    const refresh = this._tokens.value?.refresh;
    return this.http.post<{ access: string }>(`${this.base}/token/refresh/`, { refresh }).pipe(
      tap(res => this.store({ ...this._tokens.value!, access: res.access }))
    );
  }

  /** Forgot Password — POST /api/users/forgot-password/ */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/forgot-password/`, { email });
  }

  /** Verify Code — POST /api/users/verify-code/ */
  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.base}/verify-code/`, { email, code });
  }

  /** Reset Password — POST /api/users/reset-password/ */
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.base}/reset-password/`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokensKey);
    this._tokens.next(null);
    this.router.navigate(['/welcome']);
  }

  private store(tokens: AuthTokens): void {
    localStorage.setItem(this.tokensKey, JSON.stringify(tokens));
    this._tokens.next(tokens);
  }
}
