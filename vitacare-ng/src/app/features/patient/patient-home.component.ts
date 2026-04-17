import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { VitalsService, VitalRecord } from '../../core/services/vitals.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { VitalsChartComponent } from '../../shared/components/vitals-chart.component';
import { VitalsScannerComponent } from '../../shared/components/vitals-scanner.component';
import { Subscription } from 'rxjs';

interface QuickAction {
  icon: string; label: string; color: string; bg: string; route: string;
}

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent, VitalsChartComponent, VitalsScannerComponent],
  template: `
    <div class="bedside-dashboard page-animate">
      
      <!-- Top Assist Bar -->
      <nav class="bedside-header">
        <div class="patient-id">
          <div class="avatar">JD</div>
          <div class="name-box">
             <span class="greeting">Good Morning,</span>
             <h2>{{ userName || 'Patient' }}</h2>
          </div>
        </div>
        <button class="icon-btn logout" (click)="logout()" title="Logout">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
           </svg>
        </button>
      </nav>

      <main class="dashboard-scroll custom-scroll">
        
        <!-- Bedside Vitals (Live Monitor) -->
        <app-premium-card class="vitals-monitor">
          <div class="monitor-grid">
             <div class="vital">
                <div class="v-header">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="#E76F51"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   <span>Heart Rate</span>
                </div>
                <div class="v-value">{{ currentVitals?.heart_rate || '--' }} <small>BPM</small></div>
                <app-vitals-chart [history]="hrHistory" label="Heart Rate" color="#E76F51"></app-vitals-chart>
             </div>
             <div class="vital">
                <div class="v-header">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="#5DA69E"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                   <span>SpO2</span>
                </div>
                <div class="v-value">{{ currentVitals?.spo2 || '--' }} <small>%</small></div>
                <app-vitals-chart [history]="spo2History" label="SpO2" color="#5DA69E"></app-vitals-chart>
             </div>
          </div>
          <div class="monitor-footer">
             <span class="live-tag"><span class="dot"></span> LIVE DATA</span>
             <span class="bp-tag">Blood Pressure: {{ currentVitals?.systolic }}/{{ currentVitals?.diastolic }} mmHg</span>
          </div>
        </app-premium-card>

        <!-- Current Schedule / Next Action -->
        <section class="action-section">
           <h3 class="section-label">UPCOMING</h3>
           <app-premium-card [hoverEffect]="true" (click)="navigate('/patient-chat')" class="appointment-banner">
              <div class="banner-inner">
                 <div class="b-icon">👨‍⚕️</div>
                 <div class="b-text">
                    <strong>Checkup with {{ appointment }}</strong>
                    <p>Expected arrival in 15 minutes</p>
                 </div>
                 <div class="b-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                       <path d="M9 18l6-6-6-6"/>
                    </svg>
                 </div>
              </div>
           </app-premium-card>
        </section>

        <!-- Large Format Activity Tiles -->
        <section class="tiles-section stagger">
           <button *ngFor="let action of quickActions" 
                   class="large-tile" 
                   (click)="navigate(action.route)"
                   [style.--tile-color]="action.color"
                   [style.--tile-bg]="action.bg">
              <div class="tile-icon-wrap" [innerHTML]="action.icon"></div>
              <div class="tile-label">{{ action.label }}</div>
           </button>
        </section>

        <!-- Health Note -->
        <div class="comfort-note">
           <p>Your care team is monitoring your stats. Rest well.</p>
        </div>

      </main>

      <!-- Emergency Assistance Button -->
      <div class="emergency-fab" (click)="requestImmediateHelp()">
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01"/>
         </svg>
      </div>

      <!-- Vitals Scanner Dialog -->
      <app-vitals-scanner #vitalsScanner (result)="onScanResult($event)"></app-vitals-scanner>

    </div>
  `,
  styles: [`
    .bedside-dashboard {
      height: 100vh;
      display: flex; flex-direction: column;
      background: var(--background-cream);
      overflow: hidden;
    }

    .bedside-header {
       padding: 30px 24px 20px;
       display: flex; justify-content: space-between; align-items: flex-start;
    }

    .patient-id {
       display: flex; align-items: center; gap: 16px;
       .avatar { 
         width: 52px; height: 52px; border-radius: var(--radius-md); 
         background: var(--primary-color); color: white; display: flex; 
         align-items: center; justify-content: center; font-weight: 700;
       }
       .greeting { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
       h2 { font-size: 1.3rem; margin: 0; color: var(--text-dark); }
    }

    .icon-btn {
       width: 44px; height: 44px; border-radius: 50%;
       background: white; border: 1px solid var(--border-light);
       display: flex; align-items: center; justify-content: center;
       color: var(--text-muted);
    }
    .icon-btn.logout:hover { color: var(--error); border-color: var(--error); }

    .dashboard-scroll {
       flex: 1; overflow-y: auto; padding: 0 24px 100px;
       display: flex; flex-direction: column; gap: 24px;
    }

    /* Vitals Visualizer */
    .vitals-monitor {
       background: var(--primary-dark);
       color: white; border: none;
       padding: 24px;
    }
    .monitor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .vital {
       display: flex; flex-direction: column; gap: 4px;
       .v-header { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; opacity: 0.7; }
       .v-value { font-size: 1.8rem; font-weight: 700; display: flex; align-items: baseline; gap: 4px; }
       .v-value small { font-size: 0.8rem; font-weight: 500; opacity: 0.6; }
    }
    
    .monitor-footer {
       margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);
       display: flex; justify-content: space-between; align-items: center;
       font-size: 0.75rem; font-weight: 600;
       .live-tag { color: #22c55e; display: flex; align-items: center; gap: 6px; }
       .live-tag .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }
       .bp-tag { opacity: 0.6; }
    }

    /* Sections */
    .section-label { 
       font-size: 0.75rem; font-weight: 800; color: var(--text-ultralight); 
       letter-spacing: 0.1em; margin-bottom: 12px; padding-left: 4px;
    }

    .appointment-banner {
       background: white; cursor: pointer;
       .banner-inner { display: flex; align-items: center; gap: 16px; }
       .b-icon { font-size: 1.5rem; width: 48px; height: 48px; background: var(--background-cream); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
       .b-text { flex: 1; }
       .b-text strong { display: block; font-size: 0.95rem; color: var(--text-dark); margin-bottom: 2px; }
       .b-text p { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
       .b-arrow { color: var(--primary-light); opacity: 0.5; }
    }

    /* Large Tiles */
    .tiles-section {
       display: flex; flex-direction: column; gap: 12px;
    }
    .large-tile {
       background: white; border-radius: var(--radius-md); padding: 20px 24px;
       display: flex; align-items: center; gap: 18px;
       box-shadow: var(--shadow-xs); transition: all 0.2s;
       text-align: left; border: 1px solid transparent;
       
       .tile-icon-wrap { 
         width: 52px; height: 52px; border-radius: 16px;
         background: var(--tile-bg); color: var(--tile-color);
         display: flex; align-items: center; justify-content: center;
       }
       .tile-label { font-size: 1rem; font-weight: 600; color: var(--text-dark); }
    }
    .large-tile:active { transform: scale(0.98); background: var(--background-cream); border-color: var(--border-light); }

    .comfort-note {
       text-align: center; color: var(--text-ultralight); font-size: 0.8rem;
       font-style: italic; padding: 20px 0;
    }

    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); }
  `]
})
export class PatientHomeComponent implements OnInit, OnDestroy {
  userName = '';
  appointment = 'Loading...';
  currentVitals?: VitalRecord;
  hrHistory: any[] = [];
  spo2History: any[] = [];
  private subs = new Subscription();

  quickActions: QuickAction[] = [
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/></svg>`,
      label: 'Vital Sense Scan', color: '#E76F51', bg: '#FDF1EE', route: 'SCAN'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
      label: 'Chat with Doctor', color: '#4A6759', bg: '#EDF2F0', route: '/patient-chat'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM15 9h-2V7h2v2zm-4 0H9V7h2v2zM7 9H5V7h2v2z"/></svg>`,
      label: 'Prescriptions', color: '#E76F51', bg: '#FDF1EE', route: '/patient-prescriptions'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>`,
      label: 'Book Checkup', color: '#6B8BA4', bg: '#F2F6F9', route: '/book-appointment'
    },
    {
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2z"/></svg>`,
      label: 'Medical Records', color: '#5DA69E', bg: '#F2F9F8', route: '/patient-consultations'
    }
  ];

  @ViewChild('vitalsScanner') vitalsScanner!: VitalsScannerComponent;

  constructor(
    private router: Router, 
    private api: ApiService, 
    private auth: AuthService,
    private vitalsService: VitalsService
  ) {}

  ngOnInit() { 
    this.userName = 'Patient';
    this.loadAppointment(); 
    this.startVitalsStream();
  }

  startVitalsStream() {
    this.subs.add(this.vitalsService.getSimulationStream().subscribe(rec => {
      this.currentVitals = rec;
      this.hrHistory = [...this.hrHistory.slice(-20), { x: rec.timestamp, y: rec.heart_rate }];
      this.spo2History = [...this.spo2History.slice(-20), { x: rec.timestamp, y: rec.spo2 }];
    }));
  }

  loadAppointment() {
    this.api.getAppointments().subscribe({
      next: (appts: any[]) => {
        if (appts?.length) {
          const latest = appts[0];
          this.appointment = latest.doctor_name || 'Sarah Smith';
        } else {
          this.appointment = 'Dr. Sarah Smith';
        }
      },
      error: () => { this.appointment = 'Dr. Sarah Smith'; }
    });
  }

  requestImmediateHelp() {
    if (confirm('Request immediate nurse assistance to your room?')) {
       alert('Assistance requested. A nurse will arrive shortly.');
    }
  }

  navigate(route: string) { 
    if (route === 'SCAN') {
      this.vitalsScanner.show();
      return;
    }
    this.router.navigate([route]); 
  }

  onScanResult(res: {bpm: number, spo2: number}) {
    // Record it via the service
    const record = {
      heart_rate: res.bpm,
      spo2: res.spo2,
      temperature: 36.6, // Default for simulation
      systolic: 120,
      diastolic: 80,
      timestamp: new Date().toISOString()
    };
    
    this.vitalsService.recordVitals(record).subscribe(() => {
       alert('Vitals successfully recorded and sent to your clinical team.');
       // The UI will update automatically because we are subscribed to the stats
    });
  }

  logout() { this.auth.logout(); }

  ngOnDestroy() { this.subs.unsubscribe(); }
}
