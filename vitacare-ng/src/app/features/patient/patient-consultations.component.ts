import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

@Component({
  selector: 'app-patient-consultations',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>Consultation History</h1>
        <span></span>
      </div>

      <div class="page-content">
        <div *ngIf="loading" class="skeleton-list">
          <div class="skeleton-card" *ngFor="let n of [1,2,3]"></div>
        </div>

        <div *ngIf="!loading && consultations.length > 0" class="items-list stagger">
          <app-premium-card *ngFor="let c of consultations" [hoverEffect]="true">
            <div class="consult-item">
              <div class="date-badge">
                <span class="day">{{ getDay(c.date || c.created_at) }}</span>
                <span class="month">{{ getMonth(c.date || c.created_at) }}</span>
              </div>
              <div class="consult-info">
                <strong>{{ c.doctor_name || 'Doctor' }}</strong>
                <span>{{ c.diagnosis || c.notes || 'Consultation completed' }}</span>
              </div>
              <span class="chip chip-teal">Completed</span>
            </div>
          </app-premium-card>
        </div>

        <div *ngIf="!loading && consultations.length === 0" class="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d0cbc6" stroke-width="1.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p>No consultations yet</p>
          <span>Your consultation history will appear here</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: var(--background-cream); }
    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface-white); box-shadow: var(--shadow-xs); position: sticky; top: 0; z-index: 10; }
    .page-header h1 { font-size: 1.05rem; color: var(--text-dark); }
    .back-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; padding: 6px; border-radius: 8px; transition: background 0.2s; }
    .back-btn:hover { background: var(--primary-pale); }
    .page-content { max-width: 520px; margin: 0 auto; padding: 20px; }
    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
    .skeleton-card { height: 80px; border-radius: 16px; background: linear-gradient(90deg, #f0eeeb 25%, #e8e5e1 50%, #f0eeeb 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .consult-item { display: flex; align-items: center; gap: 14px; }
    .date-badge { width: 48px; height: 48px; background: var(--teal-pale); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .day { font-size: 1rem; font-weight: 700; color: var(--teal); line-height: 1; }
    .month { font-size: 0.62rem; color: var(--teal); text-transform: uppercase; letter-spacing: 0.5px; }
    .consult-info { flex: 1; }
    .consult-info strong { display: block; font-size: 0.91rem; font-weight: 600; color: var(--text-dark); }
    .consult-info span { font-size: 0.78rem; color: var(--text-muted); }
    .chip { padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
    .chip-teal { background: rgba(93,166,158,0.1); color: var(--teal); }
    .empty-state { padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .empty-state p { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
    .empty-state span { color: var(--text-ultralight); font-size: 0.8rem; max-width: 260px; line-height: 1.5; }
  `]
})
export class PatientConsultationsComponent implements OnInit {
  consultations: any[] = [];
  loading = true;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.api.getConsultations().subscribe({
      next: (d: any[]) => { this.consultations = d; this.loading = false; },
      error: () => { this.consultations = []; this.loading = false; }
    });
  }

  getDay(dateStr: string) { return dateStr ? new Date(dateStr).getDate() : '--'; }
  getMonth(dateStr: string) { return dateStr ? new Date(dateStr).toLocaleString('default', { month: 'short' }) : '---'; }
  goBack() { this.router.navigate(['/patient-home']); }
}
