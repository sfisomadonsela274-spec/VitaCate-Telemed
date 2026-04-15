import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

interface Appointment { id: number; patient_name: string; date: string; status: string; }

@Component({
  selector: 'app-doctor-home',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <div class="doctor-home">
      <div class="header-bg"></div>

      <div class="page-wrapper">
        <!-- Top Nav -->
        <nav class="top-nav">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 3V5H4V9H2V11H4V15H8V17H10V15H14V17H16V15H20V11H22V9H20V5H16V3H14V5H10V3H8ZM10 7H14V9H16V13H14V15H10V13H8V9H10V7Z"/>
            </svg>
          </div>
          <span class="portal-label">Doctor Portal</span>
          <div class="nav-actions">
            <button class="nav-btn" (click)="loadAppointments()" title="Refresh">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="nav-btn logout" (click)="logout()" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </nav>

        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div>
            <h1>Doctor Dashboard</h1>
            <p>Manage your appointments and patient care</p>
          </div>
          <div class="stats-pill">
            <span class="stat-number">{{ appointments.length }}</span>
            <span class="stat-label">Today</span>
          </div>
        </div>

        <!-- Appointments Card -->
        <app-premium-card class="section-card">
          <div class="section-header">
            <h2>Today's Appointments</h2>
            <button class="view-all-btn" (click)="navigate('/doctor-appointments')">View All</button>
          </div>
          <div class="appointments-list" *ngIf="appointments.length > 0; else noAppts">
            <div *ngFor="let appt of appointments" class="appointment-item" (click)="navigate('/appointment-detail')">
              <div class="appt-avatar">
                {{ getInitials(appt.patient_name) }}
              </div>
              <div class="appt-info">
                <strong>{{ appt.patient_name }}</strong>
                <span>{{ appt.date }}</span>
              </div>
              <div class="appt-status" [class]="'status-' + appt.status">
                {{ appt.status }}
              </div>
            </div>
          </div>
          <ng-template #noAppts>
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>No appointments for today</p>
            </div>
          </ng-template>
        </app-premium-card>

        <!-- Quick Actions -->
        <app-premium-card class="section-card">
          <h2 class="section-title">Quick Actions</h2>
          <div class="action-btns">
            <button class="action-btn primary" (click)="navigate('/doctor-appointments')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
              View All Appointments
            </button>
            <button class="action-btn secondary" (click)="navigate('/add-consultation')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              Add Consultation
            </button>
            <button class="action-btn teal" (click)="navigate('/add-prescription')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3h-2V7h2v2zm-4 0H9V7h2v2z"/></svg>
              Add Prescription
            </button>
            <button class="action-btn purple" (click)="navigate('/doctor-chat')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              Chat with Patient
            </button>
          </div>
        </app-premium-card>

        <!-- Overview Stats -->
        <app-premium-card class="section-card stats-card">
          <h2 class="section-title">Today's Overview</h2>
          <div class="stats-grid">
            <div class="stat-block">
              <span class="stat-count">{{ appointments.length }}</span>
              <span class="stat-desc">Appointments</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <span class="stat-count accent">3</span>
              <span class="stat-desc">Updated Records</span>
            </div>
          </div>
        </app-premium-card>

        <footer class="page-footer">
          <p>VitaCare Doctor Portal</p>
          <span>Professional Healthcare Excellence</span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .doctor-home { min-height: 100vh; background-color: var(--background-cream); position: relative; }
    .header-bg {
      position: absolute; top: 0; left: 0; right: 0; height: 200px;
      background: linear-gradient(135deg, #3d5a72 0%, #5b7fa6 100%);
      border-radius: 0 0 32px 32px;
    }
    .page-wrapper { position: relative; z-index: 1; max-width: 520px; margin: 0 auto; padding: 16px 20px 40px; }
    .top-nav { display: flex; align-items: center; padding: 12px 0; }
    .logo-mark {
      width: 36px; height: 36px; background: rgba(255,255,255,0.2);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }
    .portal-label { flex: 1; text-align: center; color: white; font-family: var(--font-header); font-weight: 500; font-size: 1rem; }
    .nav-actions { display: flex; gap: 8px; }
    .nav-btn {
      width: 36px; height: 36px; background: rgba(255,255,255,0.15);
      border: none; border-radius: 10px; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: background 0.2s;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.25); }
    .nav-btn.logout { color: rgba(255,200,200,0.9); }
    .welcome-banner {
      padding: 16px 0 24px; color: white;
      display: flex; justify-content: space-between; align-items: center;
    }
    .welcome-banner h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 4px; }
    .welcome-banner p { font-size: 0.85rem; opacity: 0.85; }
    .stats-pill {
      background: rgba(255,255,255,0.2); border-radius: 16px;
      padding: 10px 16px; text-align: center;
    }
    .stat-number { display: block; font-size: 1.8rem; font-weight: 700; color: white; line-height: 1; }
    .stat-label { font-size: 0.65rem; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; }
    .section-card { margin-bottom: 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2, .section-title { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin: 0 0 14px; }
    .section-header h2 { margin: 0; }
    .view-all-btn {
      background: rgba(61,90,114,0.08); color: #3d5a72;
      border: none; border-radius: 10px; padding: 6px 14px;
      font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .view-all-btn:hover { background: rgba(61,90,114,0.15); }
    .appointments-list { display: flex; flex-direction: column; gap: 12px; }
    .appointment-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; background: #f8f7f5; border-radius: 12px; cursor: pointer;
      transition: background 0.2s;
    }
    .appointment-item:hover { background: #f0eeeb; }
    .appt-avatar {
      width: 40px; height: 40px; background: linear-gradient(135deg, #3d5a72, #5b7fa6);
      border-radius: 12px; color: white; font-weight: 700; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .appt-info { flex: 1; }
    .appt-info strong { display: block; font-size: 0.9rem; color: var(--text-dark); margin-bottom: 2px; }
    .appt-info span { font-size: 0.75rem; color: #999; }
    .appt-status {
      padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; text-transform: capitalize;
    }
    .status-scheduled { background: rgba(88,112,100,0.1); color: var(--primary-color); }
    .status-completed { background: rgba(93,166,158,0.1); color: #5da69e; }
    .status-pending { background: rgba(242,139,131,0.1); color: #f28b83; }
    .empty-state { padding: 32px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-state p { color: #bbb; font-size: 0.85rem; }
    .action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .action-btn {
      border: none; border-radius: 12px; padding: 12px 14px;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
      transition: filter 0.2s, transform 0.1s;
    }
    .action-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
    .action-btn.primary { background: #3d5a72; color: white; }
    .action-btn.secondary { background: #5b7fa6; color: white; }
    .action-btn.teal { background: var(--primary-color); color: white; }
    .action-btn.purple { background: #7b67b5; color: white; }
    .stats-card .section-title { margin-bottom: 16px; }
    .stats-grid { display: flex; align-items: center; gap: 0; }
    .stat-block { flex: 1; text-align: center; padding: 8px 0; }
    .stat-count { display: block; font-size: 2rem; font-weight: 700; color: var(--text-dark); }
    .stat-count.accent { color: var(--secondary-color); }
    .stat-desc { font-size: 0.75rem; color: #999; }
    .stat-divider { width: 1px; height: 48px; background: #eee; }
    .page-footer { text-align: center; padding-top: 24px; }
    .page-footer p { font-size: 0.75rem; color: #7f7e7d; font-weight: 500; margin-bottom: 4px; }
    .page-footer span { font-size: 0.65rem; color: #bcbcbc; }
  `]
})
export class DoctorHomeComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private router: Router, private api: ApiService, private auth: AuthService) {}

  ngOnInit() { this.loadAppointments(); }

  loadAppointments() {
    this.api.getDoctorAppointments().subscribe({
      next: (data: any[]) => { this.appointments = data || []; },
      error: () => {
        // Demo fallback
        this.appointments = [
          { id: 1, patient_name: 'Sarah Johnson', date: '10:00 AM', status: 'scheduled' },
          { id: 2, patient_name: 'Michael Chen', date: '11:30 AM', status: 'scheduled' },
          { id: 3, patient_name: 'Amara Ndlovu', date: '2:00 PM', status: 'pending' },
        ];
      }
    });
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  navigate(route: string) { this.router.navigate([route]); }
  logout() { this.auth.logout(); }
}
