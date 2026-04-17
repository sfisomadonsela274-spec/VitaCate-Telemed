import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-doctor-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, PrimaryButtonComponent, InputFieldComponent],
  template: `
    <div class="login-container">
      <div class="bg-arc top-arc"></div>

      <div class="content-wrapper">
        <div class="navigation-row">
          <button class="back-btn" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="header-section">
          <div class="icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V5H4V9H2V11H4V15H8V17H10V15H14V17H16V15H20V11H22V9H20V5H16V3H14V5H10V3H8ZM10 7H14V9H16V13H14V15H10V13H8V9H10V7Z" />
              <path d="M11 10H13V12H11V10Z" fill="white"/>
            </svg>
          </div>
          <h1>Doctor Portal</h1>
          <p class="subtitle">Secure access to your medical dashboard</p>
        </div>

        <app-premium-card class="login-card">
          <form class="login-form" (ngSubmit)="login()">
            
            <h2 class="card-title">Login to Your Account</h2>

            <app-input-field 
              label="Professional Email" 
              placeholder="doctor@vitacare.com" 
              type="email"
              [(value)]="email"
              (valueChange)="email = $event">
            </app-input-field>

            <app-input-field 
              label="Medical License Number" 
              placeholder="LIC-12345678" 
              type="text"
              [(value)]="license"
              (valueChange)="license = $event">
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
              (onClick)="login()"
              [loading]="isLoading">
              Sign In
            </app-primary-button>
            <p *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</p>

          </form>
        </app-premium-card>

        <div class="footer-section">
          <p>VitaCare Medical Systems</p>
          <span class="muted">Secure • Reliable • Professional</span>
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
      width: 150vw;
      height: 60vh;
      background-color: var(--secondary-pale); 
      top: -30vh;
      left: -25vw;
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .navigation-row {
      margin-bottom: 8px;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--primary-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 12px;
      transition: background-color 0.2s;
    }
    .back-btn:hover {
      background-color: var(--secondary-pale);
    }

    .header-section {
      text-align: center;
      margin-bottom: 8px;
    }

    .icon-wrapper {
      margin-bottom: 12px;
    }

    h1 {
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: 4px;
    }

    .subtitle {
      color: #7f7e7d;
      font-size: 0.85rem;
    }

    .card-title {
      font-size: 1.2rem;
      text-align: center;
      margin-bottom: 24px;
      color: var(--primary-dark);
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

    .footer-section {
      text-align: center;
      margin-top: 24px;
      
      p {
        font-size: 0.75rem;
        color: #7f7e7d;
        font-weight: 500;
        margin-bottom: 4px;
      }
      .muted {
        font-size: 0.65rem;
        color: #bcbcbc;
      }
    }
  `]
})
export class DoctorLoginComponent {
  email = '';
  license = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private auth: AuthService) {}

  goBack() { this.router.navigate(['/welcome']); }
  goToForgotPassword() { this.router.navigate(['/forgot-password']); }

  login() {
    if (!this.email || !this.password || !this.license) {
      this.errorMessage = 'Please enter all credentials';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    
    this.auth.doctorLogin(this.email, this.password, this.license).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/doctor-home']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Invalid credentials. Please try again.';
      }
    });
  }
}
