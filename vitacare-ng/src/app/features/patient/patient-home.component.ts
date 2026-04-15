import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

interface QuickAction {
  icon: string; label: string; color: string; bg: string; route: string;
}

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <div class="patient-home">
      <!-- Top header gradient -->
      <div class="header-bg"></div>

      <div class="page-wrapper">
        <!-- Top Nav -->
        <nav class="top-nav">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19 10H14V5H10V10H5V14H10V19H14V14H19V10Z"/>
            </svg>
          </div>
          <div class="nav-actions">
            <button class="nav-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <button class="nav-btn logout" (click)="logout()" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </nav>

        <!-- Welcome Hero -->
        <div class="welcome-hero">
          <h1>Welcome back{{ userName ? ', ' + userName : '' }}!</h1>
          <p>Your health dashboard is ready</p>
        </div>

        <!-- Latest Appointment Card -->
        <div class="appointment-hero-card">
          <div class="acard-left">
            <div class="acard-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
              </svg>
            </div>
            <div class="acard-text">
              <span class="acard-label">Latest Appointment</span>
              <span class="acard-value">{{ appointment }}</span>
            </div>
          </div>
          <button class="refresh-btn" (click)="loadAppointment()">Refresh</button>
        </div>

        <!-- Quick Actions -->
        <section class="section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <button *ngFor="let action of quickActions" class="action-card" (click)="navigate(action.route)"
              [style.--accent-color]="action.color" [style.--accent-bg]="action.bg">
              <div class="action-icon-wrap" [innerHTML]="action.icon"></div>
              <span>{{ action.label }}</span>
            </button>
          </div>
        </section>

        <!-- Health Tip -->
        <app-premium-card class="health-tip-card">
          <div class="tip-content">
            <div class="tip-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#c9a834">
                <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
              </svg>
            </div>
            <div class="tip-text">
              <strong>Health Tip</strong>
              <p>Remember to take your medications on time and stay hydrated!</p>
            </div>
          </div>
        </app-premium-card>

        <footer class="page-footer">
          <p>VitaCare Patient Portal</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .patient-home {
      min-height: 100vh;
      background-color: var(--background-cream);
      position: relative;
    }
    .header-bg {
      position: absolute; top: 0; left: 0; right: 0; height: 220px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
      border-radius: 0 0 32px 32px;
    }
    .page-wrapper {
      position: relative; z-index: 1;
      max-width: 480px; margin: 0 auto; padding: 16px 20px 32px;
    }
    .top-nav {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0;
    }
    .logo-mark {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-actions { display: flex; gap: 8px; }
    .nav-btn {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.15);
      border: none; border-radius: 10px;
      color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.25); }
    .nav-btn.logout { color: rgba(255,220,200,0.9); }
    .welcome-hero { padding: 16px 0 20px; color: white; }
    .welcome-hero h1 { font-size: 1.6rem; font-weight: 600; margin-bottom: 4px; }
    .welcome-hero p { font-size: 0.9rem; opacity: 0.85; }
    .appointment-hero-card {
      background: white;
      border-radius: 20px;
      padding: 20px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: var(--shadow-premium);
      margin-bottom: 24px;
    }
    .acard-left { display: flex; align-items: center; gap: 14px; }
    .acard-icon {
      width: 52px; height: 52px;
      background: var(--primary-color);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .acard-text { display: flex; flex-direction: column; gap: 4px; }
    .acard-label { font-size: 0.75rem; color: #999; font-weight: 500; }
    .acard-value { font-size: 0.9rem; color: var(--text-dark); font-weight: 500; }
    .refresh-btn {
      background: rgba(88,112,100,0.08);
      color: var(--primary-color);
      border: none; border-radius: 10px;
      padding: 8px 16px; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
      white-space: nowrap;
    }
    .refresh-btn:hover { background: rgba(88,112,100,0.15); }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 1rem; font-weight: 600; color: var(--text-dark);
      margin-bottom: 14px;
    }
    .actions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    .action-card {
      background: white;
      border: none; border-radius: 16px;
      padding: 16px 14px;
      display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      text-align: left;
      span { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); line-height: 1.3; }
    }
    .action-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
    .action-icon-wrap {
      width: 42px; height: 42px;
      background: var(--accent-bg, rgba(88,112,100,0.08));
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .health-tip-card { margin-bottom: 24px; }
    .tip-content { display: flex; align-items: flex-start; gap: 14px; }
    .tip-icon {
      width: 42px; height: 42px; flex-shrink: 0;
      background: rgba(201,168,52,0.1);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .tip-text strong { font-size: 0.85rem; color: #c9a834; display: block; margin-bottom: 6px; }
    .tip-text p { font-size: 0.8rem; color: #7f7e7d; line-height: 1.5; margin: 0; }
    .page-footer { text-align: center; padding-top: 16px; }
    .page-footer p { font-size: 0.65rem; color: #bcbcbc; }
  `]
})
export class PatientHomeComponent implements OnInit {
  userName = '';
  appointment = 'Loading...';

  quickActions: QuickAction[] = [
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="rgb(88,112,100)"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>`,
      label: 'Book Appointment', color: 'rgb(88,112,100)', bg: 'rgba(88,112,100,0.08)', route: '/book-appointment'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="rgb(242,139,131)"><path d="M20 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3h-2V7h2v2zm-4 0H9V7h2v2zM7 9H5V7h2v2zm13 11H4V10h16v10z"/></svg>`,
      label: 'View Prescriptions', color: 'rgb(242,139,131)', bg: 'rgba(242,139,131,0.08)', route: '/patient-prescriptions'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="rgb(93,166,158)"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
      label: 'View Consultations', color: 'rgb(93,166,158)', bg: 'rgba(93,166,158,0.08)', route: '/patient-consultations'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="rgb(159,144,198)"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
      label: 'Chat with Doctor', color: 'rgb(159,144,198)', bg: 'rgba(159,144,198,0.08)', route: '/patient-chat'
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="rgb(93,166,158)"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
      label: 'Video Call', color: 'rgb(93,166,158)', bg: 'rgba(93,166,158,0.08)', route: '/video-call'
    },
  ];

  constructor(private router: Router, private api: ApiService, private auth: AuthService) {}

  ngOnInit() { this.loadAppointment(); }

  loadAppointment() {
    this.appointment = 'Loading...';
    this.api.getAppointments().subscribe({
      next: (appts: any[]) => {
        if (appts?.length) {
          const latest = appts[0];
          this.appointment = `${latest.doctor_name || 'Dr.'} — ${latest.date || 'Scheduled'}`;
        } else {
          this.appointment = 'No upcoming appointments';
        }
      },
      error: () => { this.appointment = 'No upcoming appointments'; }
    });
  }

  navigate(route: string) { this.router.navigate([route]); }

  logout() { this.auth.logout(); }
}
