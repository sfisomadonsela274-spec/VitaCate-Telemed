import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { supabase } from '../supabase';
import { environment } from '../../../environments/environment';
import { CONFIG } from '../config';

export interface AuthTokens {
  access: string;
  refresh: string;
  role: string;
  user_id?: string;
}

export interface DoctorProfile {
  id: string;
  full_name: string;
  email: string;
  license_number: string;
  specialization?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokensKey = 'vitacare_tokens';
  private _tokens = new BehaviorSubject<AuthTokens | null>(this.storedTokens());
  currentUser$ = this._tokens.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get isLoggedIn() { return !!this._tokens.value; }
  get currentRole() { return this._tokens.value?.role ?? null; }
  get accessToken() { return this._tokens.value?.access ?? null; }
  get userId() { return this._tokens.value?.user_id ?? null; }

  private storedTokens(): AuthTokens | null {
    try {
      const r = localStorage.getItem(this.tokensKey);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  }

  /** Patient / generic login */
  patientLogin(email: string, password: string): Observable<AuthTokens> {
    return from(supabase.auth.signInWithPassword({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        return this.fetchProfile(data.session!);
      }),
      tap(tokens => this.store(tokens)),
      catchError(err => {
        console.error('[AuthService] Login error:', err);
        throw err;
      })
    );
  }

  /** Doctor login — verifies license_number via Edge Function */
  doctorLogin(email: string, password: string, license: string): Observable<AuthTokens> {
    return from(
      supabase.functions.invoke('doctor-login', {
        body: { email, password, license_number: license }
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        const tokens: AuthTokens = {
          access: data.session.access_token,
          refresh: data.session.refresh_token,
          role: 'doctor',
          user_id: data.doctor.id
        };
        return of(tokens);
      }),
      tap(tokens => this.store(tokens)),
      catchError(err => {
        console.error('[AuthService] Doctor login error:', err);
        throw err;
      })
    );
  }

  /** Registration */
  register(data: { email: string; password: string; first_name?: string; last_name?: string; role?: string }): Observable<any> {
    return from(
      supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
            role: data.role ?? 'patient'
          }
        }
      })
    ).pipe(
      tap(result => {
        if (result.data.user) {
          this.fetchProfile(result.data.session!).subscribe();
        }
      }),
      catchError(err => { throw err; })
    );
  }

  /** Forgot password — sends reset email via Supabase */
  forgotPassword(email: string): Observable<any> {
    return from(supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${CONFIG.BASE_URL}forgot-password?step=reset`
    })).pipe(
      switchMap(({ error }) => {
        if (error) throw error;
        return of({ success: true });
      }),
      catchError(err => { throw err; })
    );
  }

  /** Update password for the current session (after clicking reset link) */
  updatePassword(newPassword: string): Observable<any> {
    return from(supabase.auth.updateUser({ password: newPassword })).pipe(
      switchMap(({ error }) => {
        if (error) throw error;
        return of({ success: true });
      }),
      catchError(err => { throw err; })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokensKey);
    this._tokens.next(null);
    supabase.auth.signOut();
    this.router.navigate(['/welcome']);
  }

  private store(tokens: AuthTokens): void {
    localStorage.setItem(this.tokensKey, JSON.stringify(tokens));
    this._tokens.next(tokens);
  }

  private fetchProfile(session: any): Observable<AuthTokens> {
    // If we have a doctor role metadata in the user, we should also check the doctors table
    const role = session.user.user_metadata?.role || 'patient';
    
    if (role === 'doctor') {
        return from(
          supabase
            .from('doctors')
            .select('*')
            .eq('id', session.user.id)
            .single()
        ).pipe(
          map(({ data, error }) => {
            const tokens: AuthTokens = {
              access: session.access_token,
              refresh: session.refresh_token,
              role: 'doctor',
              user_id: session.user.id
            };
            return tokens;
          })
        );
    }

    return from(
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
    ).pipe(
      switchMap(({ data, error }) => {
        // If profile doesn't exist yet (e.g. trigger lag), fallback to metadata
        const finalRole = data?.role || role;
        const tokens: AuthTokens = {
          access: session.access_token,
          refresh: session.refresh_token,
          role: finalRole,
          user_id: session.user.id
        };
        return of(tokens);
      })
    );
  }

  /** Call on app init to restore session */
  async restoreSession(): Promise<AuthTokens | null> {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const tokens = await new Promise<AuthTokens>((resolve) => {
        this.fetchProfile(data.session!).subscribe(t => resolve(t));
      });
      this.store(tokens);
      return tokens;
    }
    return null;
  }
}
