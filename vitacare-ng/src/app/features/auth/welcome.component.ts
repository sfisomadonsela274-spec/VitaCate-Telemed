import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent, PrimaryButtonComponent],
  template: `
    <div class="welcome-container">
      <!-- Decorative background elements simulating Kivy canvas ellipses -->
      <div class="bg-arc top-arc"></div>
      <div class="bg-arc bottom-arc"></div>

      <div class="content-wrapper">
        <div class="header-section">
          <div class="logo-container">
            <div class="logo-circle">
              <!-- Inline SVG for medical cross -->
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 10H14V5C14 4.44772 13.5523 4 13 4H11C10.4477 4 10 4.44772 10 5V10H5C4.44772 10 4 10.4477 4 11V13C4 13.5523 4.44772 14 5 14H10V19C10 19.5523 10.4477 20 11 20H13C13.5523 20 14 19.5523 14 19V14H19C19.5523 14 20 13.5523 20 13V11C20 10.4477 19.5523 10 19 10Z"/>
              </svg>
            </div>
          </div>
          <h1>VitaCare</h1>
          <p class="subtitle">Modern Telemedicine Platform</p>
        </div>

        <app-premium-card [hoverEffect]="true" class="access-card">
          <div class="card-content">
            <h2>Welcome</h2>
            <p>Please select your portal to continue</p>
            
            <div class="action-buttons">
              <app-primary-button 
                [fullWidth]="true" 
                (onClick)="navigateTo('patient-login')">
                Patient Portal
              </app-primary-button>
              
              <app-primary-button 
                [fullWidth]="true" 
                (onClick)="navigateTo('doctor-login')">
                Doctor Portal
              </app-primary-button>
            </div>

            <div class="register-link">
              New to VitaCare? <a (click)="navigateTo('signup')">Create an account</a>
            </div>
          </div>
        </app-premium-card>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background-color: var(--background-cream);
    }
    
    .bg-arc {
      position: absolute;
      border-radius: 50%;
      z-index: 0;
    }
    .top-arc {
      width: 150vw;
      height: 80vh;
      background-color: rgba(88, 112, 100, 0.08); /* Sage tint */
      top: -40vh;
      left: -25vw;
    }
    .bottom-arc {
      width: 120vw;
      height: 60vh;
      background-color: rgba(242, 139, 131, 0.05); /* Coral tint */
      bottom: -20vh;
      right: -10vw;
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 400px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header-section {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .logo-container {
      position: relative;
      width: 100px;
      height: 100px;
    }
    
    .logo-container::before {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background-color: rgba(88, 112, 100, 0.2);
      border-radius: 50%;
    }

    .logo-circle {
      width: 100%;
      height: 100%;
      background-color: var(--primary-color);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    h1 {
      font-size: 2.5rem;
      margin: 0;
    }
    
    .subtitle {
      color: var(--primary-light);
      font-size: 1.1rem;
    }

    .card-content {
      text-align: center;
      
      h2 {
        margin-bottom: 8px;
      }
      
      p {
        color: var(--text-dark);
        opacity: 0.8;
        margin-bottom: 24px;
        font-size: 0.95rem;
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .register-link {
      font-size: 0.9rem;
      color: var(--text-dark);
      
      a {
        font-weight: 500;
        cursor: pointer;
      }
    }
  `]
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
