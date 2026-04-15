import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldComponent, PrimaryButtonComponent, PremiumCardComponent],
  template: `
    <div class="auth-page page-animate">
      <div class="bg-circle top"></div>

      <div class="auth-wrapper">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18L9 12L15 6"/>
          </svg>
        </button>

        <div class="auth-header">
          <div class="icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--primary-color)">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your email — we'll send you a reset code</p>
        </div>

        <app-premium-card class="card-animate">
          <div *ngIf="!sent">
            <app-input-field label="Email Address" placeholder="you@example.com" type="email" (valueChange)="email = $event"></app-input-field>
            <p *ngIf="error" class="field-error">{{ error }}</p>
            <app-primary-button [fullWidth]="true" [loading]="loading" (onClick)="sendCode()">Send Reset Code</app-primary-button>
          </div>

          <div *ngIf="sent" class="success-state">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary-color)">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h3>Check Your Inbox</h3>
            <p>We sent a 6-digit code to <strong>{{ email }}</strong></p>
            <app-input-field label="Enter the code" placeholder="123456" (valueChange)="code = $event"></app-input-field>
            <app-primary-button [fullWidth]="true" [loading]="loading" (onClick)="verifyCode()">Verify Code</app-primary-button>
            <button class="resend-btn" (click)="sent = false">Resend code</button>
          </div>
        </app-premium-card>

        <div class="auth-footer">
          <span>Remembered it? </span><a (click)="goBack()">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; background: var(--background-cream);
      display: flex; justify-content: center; align-items: flex-start;
      overflow: hidden; position: relative;
    }
    .bg-circle { position: absolute; border-radius: 50%; z-index: 0; }
    .bg-circle.top { width: 120vw; height: 60vh; background: rgba(88,112,100,0.05); top: -30vh; left: -10vw; }
    .auth-wrapper { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: 24px 20px 40px; }
    .back-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; padding: 8px; border-radius: 10px; display: flex; margin-bottom: 16px; transition: background 0.2s; }
    .back-btn:hover { background: var(--primary-pale); }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .icon-ring { width: 68px; height: 68px; border-radius: 50%; background: var(--primary-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    h1 { font-size: 1.65rem; color: var(--primary-dark); margin-bottom: 6px; }
    p { color: var(--text-muted); font-size: 0.88rem; }
    .field-error { font-size: 0.78rem; color: var(--error); margin-bottom: 12px; }
    .success-state { text-align: center; }
    .success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(88,112,100,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .success-state h3 { font-size: 1.2rem; margin-bottom: 8px; }
    .success-state p { margin-bottom: 20px; }
    .success-state .field-wrap { text-align: left; margin-top: 16px; }
    .resend-btn { background: none; border: none; color: var(--primary-color); font-size: 0.82rem; cursor: pointer; margin-top: 12px; text-decoration: underline; width: 100%; text-align: center; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.82rem; color: var(--text-muted); a { color: var(--secondary-color); font-weight: 600; cursor: pointer; } }
  `]
})
export class ForgotPasswordComponent {
  email = ''; code = ''; sent = false; loading = false; error = '';
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/patient-login']); }
  sendCode() {
    if (!this.email) { this.error = 'Please enter your email'; return; }
    this.loading = true; this.error = '';
    setTimeout(() => { this.loading = false; this.sent = true; }, 1000);
  }
  verifyCode() {
    this.loading = true;
    setTimeout(() => { this.loading = false; this.router.navigate(['/patient-login']); }, 800);
  }
}
