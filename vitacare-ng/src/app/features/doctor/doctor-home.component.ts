import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

interface Appointment { id: string; patient_name: string; date: string; status: string; }

@Component({
  selector: 'app-doctor-home',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <div class="doctor-dashboard page-animate">
      
      <!-- Premium Glass Header -->
      <nav class="doctor-header">
        <div class="header-content">
          <div class="brand">
             <div class="logo-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19 14h-5v5h-4v-5H5v-4h5V5h4v5h5v4z"/></svg>
             </div>
             <div class="title-stack">
                <h1>VitaCare</h1>
                <span class="portal-badge">Professional Portal</span>
             </div>
          </div>
          <div class="user-menu">
             <button class="circle-btn" (click)="loadAppointments()" title="Refresh">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
             </button>
             <button class="circle-btn logout" (click)="logout()" title="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
             </button>
          </div>
        </div>
      </nav>

      <main class="dashboard-content custom-scroll">
        
        <!-- Welcome Section -->
        <header class="welcome-section">
           <div class="w-text">
              <h2>Good Morning, Dr. {{ lastName }}</h2>
              <p>You have {{ appointments.length }} consultations scheduled for today.</p>
           </div>
           <div class="live-clock">
              {{ currentTime }}
           </div>
        </header>

        <!-- Stats Overview Row -->
        <div class="stats-row stagger">
           <div class="stat-card slate">
              <span class="label">Total Appointments</span>
              <span class="value">{{ appointments.length }}</span>
           </div>
           <div class="stat-card mint">
              <span class="label">Completed</span>
              <span class="value">0</span>
           </div>
           <div class="stat-card gold">
              <span class="label">Urgent Alerts</span>
              <span class="value">0</span>
           </div>
        </div>

        <!-- Appointment List Card -->
        <app-premium-card class="schedule-card">
           <div class="card-header">
              <h3>Today's Schedule</h3>
              <button class="txt-link">Full Calendar</button>
           </div>
           
           <div class="appointments-list" *ngIf="appointments.length > 0; else noAppts">
              <div *ngFor="let appt of appointments" class="appt-row" (click)="navigate('/doctor-chat')">
                 <div class="appt-avatar">{{ getInitials(appt.patient_name) }}</div>
                 <div class="appt-meta">
                    <strong>{{ appt.patient_name }}</strong>
                    <span>Scheduled for {{ appt.date }}</span>
                 </div>
                 <div class="appt-status" [class]="appt.status">{{ appt.status }}</div>
                 <div class="appt-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                 </div>
              </div>
           </div>

           <ng-template #noAppts>
              <div class="empty-state">
                 <p>No more appointments today. Rest well, Doctor.</p>
              </div>
           </ng-template>
        </app-premium-card>

        <!-- Professional Tools Grids -->
        <section class="tools-section">
           <h3>Professional Tools</h3>
           <div class="tools-grid">
              <button class="tool-tile" (click)="navigate('/doctor-chat')">
                 <div class="icon-p t-mint">💬</div>
                 <span>Live Consultation</span>
              </button>
              <button class="tool-tile" (click)="navigate('/add-prescription')">
                 <div class="icon-p t-slate">💊</div>
                 <span>E-Prescription</span>
              </button>
              <button class="tool-tile">
                 <div class="icon-p t-gold">📋</div>
                 <span>Medical Records</span>
              </button>
           </div>
        </section>

      </main>

    </div>
  `,
  styles: [`
    .doctor-dashboard {
      height: 100vh; display: flex; flex-direction: column;
      background: var(--background-cream); overflow: hidden;
    }

    .doctor-header {
       background: var(--secondary-dark);
       padding: 24px 30px;
       color: white;
       box-shadow: var(--shadow-premium);
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
    
    .brand {
       display: flex; align-items: center; gap: 16px;
       .logo-box { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
       .title-stack h1 { font-size: 1.4rem; color: #fff; margin: 0; }
       .portal-badge { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; font-weight: 700; }
    }

    .user-menu { display: flex; gap: 12px; }
    .circle-btn {
       width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1);
       border: none; color: white; display: flex; align-items: center; justify-content: center;
       cursor: pointer; transition: all 0.2s;
    }
    .circle-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
    .circle-btn.logout:hover { background: rgba(214, 48, 49, 0.2); color: #ff7675; }

    .dashboard-content { 
       flex: 1; overflow-y: auto; padding: 40px 30px;
       max-width: 1200px; margin: 0 auto; width: 100%;
       display: flex; flex-direction: column; gap: 32px;
    }

    .welcome-section {
       display: flex; justify-content: space-between; align-items: flex-start;
       h2 { font-size: 1.8rem; margin: 0 0 8px; color: var(--text-dark); }
       p { color: var(--text-muted); font-size: 1rem; }
       .live-clock { font-family: var(--font-header); font-weight: 700; color: var(--primary-color); opacity: 0.6; }
    }

    /* Stats Cards */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
    .stat-card {
       padding: 24px; border-radius: var(--radius-lg);
       display: flex; flex-direction: column; gap: 4px;
       box-shadow: var(--shadow-soft);
       .label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; opacity: 0.8; }
       .value { font-size: 2.2rem; font-weight: 700; }
       
       &.slate { background: var(--secondary-color); color: white; }
       &.mint { background: var(--primary-light); color: white; }
       &.gold { background: var(--accent-pale); color: #b08d27; border: 1px solid rgba(233,196,106,0.2); }
    }

    /* Schedule Card */
    .schedule-card {
       .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
       h3 { font-size: 1.1rem; margin: 0; }
       .txt-link { background: none; border: none; color: var(--secondary-color); font-weight: 700; font-size: 0.85rem; cursor: pointer; }
    }

    .appointments-list { display: flex; flex-direction: column; gap: 8px; }
    .appt-row {
       display: flex; align-items: center; gap: 16px; padding: 16px; 
       background: var(--background-cream); border-radius: var(--radius-md);
       cursor: pointer; transition: all 0.2s;
       
       &:hover { background: #fff; transform: translateX(6px); box-shadow: var(--shadow-xs); }
       
       .appt-avatar { width: 48px; height: 48px; border-radius: 14px; background: var(--secondary-light); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
       .appt-meta { flex: 1; }
       .appt-meta strong { display: block; font-size: 0.95rem; color: var(--text-dark); }
       .appt-meta span { font-size: 0.8rem; color: var(--text-muted); }
       
       .appt-status { 
         font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 99px;
         background: rgba(0,0,0,0.04); color: #64748b;
         &.scheduled { background: var(--primary-pale); color: var(--primary-color); }
       }
       .appt-action { color: var(--text-ultralight); }
    }

    /* Tools */
    .tools-section {
       h3 { font-size: 0.8rem; font-weight: 800; color: var(--text-ultralight); letter-spacing: 0.1em; margin-bottom: 16px; }
    }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .tool-tile {
       background: #fff; border: 1px solid var(--border-light); padding: 24px;
       border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s;
       display: flex; flex-direction: column; gap: 12px; align-items: flex-start;
       
       &:hover { transform: translateY(-4px); box-shadow: var(--shadow-premium); border-color: var(--secondary-light); }
       
       .icon-p { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
       .icon-p.t-mint { background: var(--primary-pale); }
       .icon-p.t-slate { background: var(--secondary-pale); }
       .icon-p.t-gold { background: var(--accent-pale); }
       span { font-weight: 600; font-size: 0.9rem; color: var(--text-dark); }
    }

    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
  `]
})
export class DoctorHomeComponent implements OnInit {
  appointments: Appointment[] = [];
  lastName = '';
  currentTime = '';

  constructor(private router: Router, private api: ApiService, private auth: AuthService) {}

  ngOnInit() { 
    this.lastName = 'Doctor';
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
    this.loadAppointments(); 
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  loadAppointments() {
    this.api.getDoctorAppointments('1').subscribe({
      next: (data: any[]) => { this.appointments = data || []; },
      error: () => {
        this.appointments = [
          { id: '1', patient_name: 'Sarah Johnson', date: '10:00 AM', status: 'scheduled' },
          { id: '2', patient_name: 'Michael Chen', date: '11:30 AM', status: 'scheduled' },
          { id: '3', patient_name: 'Amara Ndlovu', date: '2:00 PM', status: 'pending' },
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
