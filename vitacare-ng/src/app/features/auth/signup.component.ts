import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, PrimaryButtonComponent, InputFieldComponent],
  template: `
    <div class="signup-container">
      <div class="bg-arc top-arc"></div>
      <div class="content-wrapper">

        <div class="navigation-row">
          <button class="back-btn" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="header-section">
          <div class="icon-wrapper">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1>Create Account</h1>
          <p class="subtitle">Join VitaCare for better healthcare</p>
        </div>

        <app-premium-card>
          <form class="signup-form" (ngSubmit)="register()">

            <div class="name-row">
              <app-input-field
                label="First Name"
                placeholder="John"
                (valueChange)="firstName = $event">
              </app-input-field>
              <app-input-field
                label="Last Name"
                placeholder="Doe"
                (valueChange)="lastName = $event">
              </app-input-field>
            </div>

            <app-input-field
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              (valueChange)="email = $event">
            </app-input-field>

            <app-input-field
              label="Phone Number"
              placeholder="+27 60 000 0000"
              type="tel"
              (valueChange)="phone = $event">
            </app-input-field>

            <app-input-field
              label="Address"
              placeholder="123 Health Street"
              (valueChange)="address = $event">
            </app-input-field>

            <app-input-field
              label="Password"
              placeholder="Create a strong password"
              type="password"
              (valueChange)="password = $event">
            </app-input-field>

            <app-input-field
              label="Confirm Password"
              placeholder="Repeat password"
              type="password"
              (valueChange)="confirmPassword = $event">
            </app-input-field>

            <p *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</p>

            <app-primary-button 
              [fullWidth]="true" 
              (onClick)="register()"
              [loading]="isLoading">
              Create Account
            </app-primary-button>

            <div class="login-link">
              Already have an account? <a (click)="goToLogin()">Sign In</a>
            </div>

          </form>
        </app-premium-card>

        <div class="footer-section">
          <p>VitaCare Medical Systems</p>
          <span>Secure • Reliable • Caring</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      position: relative;
      min-height: 100vh;
      background-color: var(--background-cream);
      display: flex;
      justify-content: center;
      overflow: hidden;
    }
    .bg-arc {
      position: absolute;
      border-radius: 50%;
      z-index: 0;
    }
    .top-arc {
      width: 150vw; height: 50vh;
      background-color: rgba(88,112,100,0.06);
      top: -20vh; left: -25vw;
    }
    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      padding: 24px;
    }
    .navigation-row { margin-bottom: 8px; }
    .back-btn {
      background: none; border: none;
      color: var(--primary-color); cursor: pointer;
      display: flex; align-items: center;
      padding: 8px; border-radius: 12px;
      transition: background-color 0.2s;
    }
    .back-btn:hover { background-color: rgba(88,112,100,0.1); }
    .header-section { text-align: center; margin-bottom: 20px; }
    .icon-wrapper {
      display: inline-flex; justify-content: center; align-items: center;
      width: 72px; height: 72px;
      background: var(--primary-color);
      border-radius: 50%;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(88,112,100,0.3);
    }
    h1 { font-size: 1.6rem; font-weight: 600; color: var(--primary-dark); margin-bottom: 4px; }
    .subtitle { color: #7f7e7d; font-size: 0.85rem; }
    .signup-form { display: flex; flex-direction: column; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .error-msg { color: var(--error); text-align: center; font-size: 0.8rem; margin-bottom: 12px; }
    .login-link {
      text-align: center; font-size: 0.82rem; color: #7f7e7d; margin-top: 16px;
      a { color: var(--secondary-color); font-weight: 600; cursor: pointer; }
    }
    .footer-section { text-align: center; padding: 24px 0 8px;
      p { font-size: 0.75rem; color: #7f7e7d; font-weight: 500; }
      span { font-size: 0.65rem; color: #bcbcbc; }
    }
  `]
})
export class SignupComponent {
  firstName = ''; lastName = ''; email = ''; phone = '';
  address = ''; password = ''; confirmPassword = '';
  isLoading = false; errorMessage = '';

  constructor(private router: Router, private auth: AuthService) {}

  goBack() { this.router.navigate(['/welcome']); }
  goToLogin() { this.router.navigate(['/patient-login']); }

  register() {
    if (!this.email || !this.password || !this.firstName || !this.lastName) {
      this.errorMessage = 'Please fill in all required fields'; return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match'; return;
    }
    this.isLoading = true; this.errorMessage = '';
    
    const registrationData = {
      email: this.email,
      password: this.password,
      confirm_password: this.confirmPassword,
      first_name: this.firstName,
      last_name: this.lastName,
      phone: this.phone,
      address: this.address,
      role: 'patient' // Defaulting to patient for this signup screen
    };

    this.auth.register(registrationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/patient-login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Registration failed. Please check your information.';
      }
    });
  }
}
