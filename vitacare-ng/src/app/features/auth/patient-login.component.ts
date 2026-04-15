import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-patient-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, PrimaryButtonComponent, InputFieldComponent],
  template: `
    <div class="login-container">
      <div class="bg-arc top-arc"></div>
      <div class="bg-arc bottom-arc"></div>

      <div class="content-wrapper">
        <div class="navigation-row">
          <button class="back-btn" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="header-section">
          <h1>Welcome Back</h1>
          <p class="subtitle">Sign in to access your health dashboard</p>
        </div>

        <app-premium-card class="login-card">
          <form class="login-form" (ngSubmit)="login()">
            <app-input-field 
              label="Email" 
              placeholder="patient@example.com" 
              type="email"
              [(value)]="email"
              (valueChange)="email = $event">
            </app-input-field>

            <app-input-field 
              label="Password" 
              placeholder="Enter your password" 
              type="password"
              [(value)]="password"
              (valueChange)="password = $event">
            </app-input-field>

            <div class="forgot-password">
              <a (click)="goToForgotPassword()">Forgot Password?</a>
            </div>

            <app-primary-button
              [fullWidth]="true"
              [loading]="isLoading"
              (onClick)="login()">
              Sign In
            </app-primary-button>
            <p *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</p>

            <div class="divider">
              <span></span>
              <p>or</p>
              <span></span>
            </div>

            <div class="signup-link">
              Don't have an account? <a (click)="goToSignup()">Sign Up</a>
            </div>
          </form>
        </app-premium-card>

        <div class="footer-section">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background-color: var(--background-cream);
      overflow: hidden;
    }

    .bg-arc {
      position: absolute;
      border-radius: 50%;
      z-index: 0;
    }
    .top-arc {
      width: 120vw;
      height: 70vh;
      background-color: rgba(88, 112, 100, 0.06); 
      top: -20vh;
      right: -25vw;
    }
    .bottom-arc {
      width: 80vw;
      height: 50vh;
      background-color: rgba(242, 139, 131, 0.04); 
      bottom: -10vh;
      left: -30vw;
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .navigation-row {
      margin-bottom: 16px;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 12px;
      transition: background-color 0.2s;
    }
    .back-btn:hover {
      background-color: rgba(88, 112, 100, 0.1);
    }

    .header-section {
      text-align: center;
      margin-bottom: 8px;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: 4px;
    }

    .subtitle {
      color: #7f7e7d;
      font-size: 0.85rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
    }

    .forgot-password {
      text-align: right;
      margin-bottom: 24px;
      margin-top: -8px;
      
      a {
        font-size: 0.75rem;
        cursor: pointer;
        color: var(--primary-color);
      }
    }

    .error-msg {
      color: var(--error);
      text-align: center;
      font-size: 0.8rem;
      margin-top: 12px;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
      
      p {
        margin: 0 16px;
        color: #bcbcbc;
        font-size: 0.75rem;
      }
      
      span {
        flex: 1;
        height: 1px;
        background-color: rgba(188, 188, 188, 0.5);
      }
    }

    .signup-link {
      text-align: center;
      font-size: 0.8rem;
      color: #7f7e7d;
      
      a {
        color: var(--secondary-color);
        font-weight: 600;
        cursor: pointer;
        font-family: var(--font-header);
      }
    }

    .footer-section {
      text-align: center;
      margin-top: 16px;
      
      p {
        font-size: 0.65rem;
        color: #bcbcbc;
      }
    }
  `]
})
export class PatientLoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private auth: AuthService) {}

  goBack() { this.router.navigate(['/welcome']); }
  goToForgotPassword() { this.router.navigate(['/forgot-password']); }
  goToSignup() { this.router.navigate(['/signup']); }

  login() {
    if (!this.email || !this.password) { this.errorMessage = 'Please enter your email and password'; return; }
    this.isLoading = true; this.errorMessage = '';
    this.auth.patientLogin(this.email, this.password).subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/patient-home']); },
      error: (err) => { this.isLoading = false; this.errorMessage = err?.error?.detail || 'Invalid credentials. Please try again.'; }
    });
  }
}
