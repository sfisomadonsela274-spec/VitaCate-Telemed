import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent, PrimaryButtonComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>Appointment Detail</h1>
        <span></span>
      </div>

      <div class="page-content">
        <app-premium-card class="card-animate detail-card" *ngIf="appointment; else loadingTpl">
          <div class="patient-header">
            <div class="avatar large">{{ appointment.patient_name?.[0] || 'P' }}</div>
            <div class="header-info">
              <h2>{{ appointment.patient_name }}</h2>
              <span class="status-chip" [class]="appointment.status">{{ appointment.status }}</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Date</label>
              <strong>{{ appointment.date }}</strong>
            </div>
            <div class="info-item" *ngIf="appointment.time">
              <label>Time</label>
              <strong>{{ appointment.time }}</strong>
            </div>
            <div class="info-item full">
              <label>Reason for Visit</label>
              <p>{{ appointment.reason || 'General Consultation' }}</p>
            </div>
          </div>

          <div class="actions-section" *ngIf="appointment.status !== 'completed'">
            <div class="divider"></div>
            <div class="btn-group">
              <app-primary-button [variant]="'outline'" (onClick)="startChat()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                Chat
              </app-primary-button>
              <app-primary-button (onClick)="markCompleted()" [loading]="loading">
                Complete Appointment
              </app-primary-button>
            </div>
          </div>
        </app-premium-card>

        <ng-template #loadingTpl>
           <div class="loading-state">
              <div class="shimmer header"></div>
              <div class="shimmer body"></div>
           </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: var(--background-cream); }
    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface-white); box-shadow: var(--shadow-xs); }
    .page-header h1 { font-size: 1.05rem; color: var(--text-dark); }
    .back-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; padding: 6px; border-radius: 8px; transition: background 0.2s; }
    .back-btn:hover { background: var(--primary-pale); }
    .page-content { max-width: 560px; margin: 0 auto; padding: 20px; }
    
    .detail-card { padding: 24px; }
    .patient-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .avatar.large { width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; }
    .header-info h2 { font-size: 1.4rem; color: var(--text-dark); margin: 0 0 8px; }
    
    .status-chip { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .status-chip.scheduled { background: rgba(88,112,100,0.1); color: var(--primary-color); }
    .status-chip.completed { background: rgba(93,166,158,0.1); color: var(--teal); }
    .status-chip.pending { background: rgba(242,139,131,0.1); color: var(--secondary-dark); }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-item.full { grid-column: span 2; }
    .info-item label { display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item strong { font-size: 1rem; color: var(--text-dark); }
    .info-item p { color: var(--text-dark); line-height: 1.5; font-size: 0.95rem; margin: 0; }
    
    .divider { height: 1px; background: var(--divider); margin: 32px 0; }
    .btn-group { display: flex; gap: 12px; justify-content: flex-end; }

    .shimmer { background: linear-gradient(90deg, #f0eeeb 25%, #e8e5e1 50%, #f0eeeb 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 12px; }
    .shimmer.header { height: 80px; margin-bottom: 20px; }
    .shimmer.body { height: 200px; }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  `]
})
export class AppointmentDetailComponent implements OnInit {
  appointment: any = null;
  loading = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private api: ApiService
  ) {}

  ngOnInit() {
    // In a real app we'd fetch by ID. Here we'll use demo data if none found.
    this.api.getDoctorAppointments().subscribe({
      next: (data: any[]) => {
        // Just pick the first one for demo purposes if no ID found
        this.appointment = data?.[0] || {
           id: 1, patient_name: 'Sarah Johnson', date: 'Today', time: '10:00 AM', status: 'scheduled', reason: 'High blood pressure follow-up. Patient reports occasional dizziness in the morning.'
        };
      },
      error: () => {
        this.appointment = {
           id: 1, patient_name: 'Sarah Johnson', date: 'Today', time: '10:00 AM', status: 'scheduled', reason: 'High blood pressure follow-up. Patient reports occasional dizziness in the morning.'
        };
      }
    });
  }

  goBack() { this.router.navigate(['/doctor-home']); }
  startChat() { this.router.navigate(['/doctor-chat']); }

  markCompleted() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.appointment.status = 'completed';
      setTimeout(() => this.goBack(), 1000);
    }, 1000);
  }
}
