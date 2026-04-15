import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>My Prescriptions</h1>
        <span></span>
      </div>

      <div class="page-content">
        <!-- Loading skeleton -->
        <div *ngIf="loading" class="skeleton-list">
          <div class="skeleton-card" *ngFor="let n of [1,2,3]"></div>
        </div>

        <!-- Prescriptions list -->
        <div *ngIf="!loading && prescriptions.length > 0" class="items-list stagger">
          <app-premium-card *ngFor="let rx of prescriptions" [hoverEffect]="true">
            <div class="rx-item">
              <div class="rx-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--secondary-color)">
                  <path d="M20 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3h-2V7h2v2zm-4 0H9V7h2v2zM7 9H5V7h2v2z"/>
                </svg>
              </div>
              <div class="rx-info">
                <strong>{{ rx.medication || rx.name || 'Medication' }}</strong>
                <span>{{ rx.dosage || 'As prescribed' }}</span>
                <span class="rx-date">{{ rx.date || rx.prescribed_at || 'Date unavailable' }}</span>
              </div>
              <span class="chip chip-coral">Active</span>
            </div>
          </app-premium-card>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && prescriptions.length === 0" class="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d0cbc6" stroke-width="1.2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
          </svg>
          <p>No prescriptions yet</p>
          <span>Your prescriptions will appear here once issued by your doctor</span>
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
    .skeleton-card { height: 88px; border-radius: 16px; background: linear-gradient(90deg, #f0eeeb 25%, #e8e5e1 50%, #f0eeeb 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .rx-item { display: flex; align-items: center; gap: 14px; }
    .rx-icon-wrap { width: 46px; height: 46px; border-radius: 14px; background: rgba(242,139,131,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rx-info { flex: 1; }
    .rx-info strong { display: block; font-size: 0.92rem; font-weight: 600; color: var(--text-dark); }
    .rx-info span { display: block; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }
    .rx-date { font-size: 0.72rem !important; color: var(--text-ultralight) !important; margin-top: 4px; }
    .chip { padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 600; }
    .chip-coral { background: rgba(242,139,131,0.1); color: var(--secondary-dark); }
    .empty-state { padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .empty-state p { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
    .empty-state span { color: var(--text-ultralight); font-size: 0.8rem; max-width: 260px; line-height: 1.5; }
  `]
})
export class PatientPrescriptionsComponent implements OnInit {
  prescriptions: any[] = [];
  loading = true;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.api.getPrescriptions().subscribe({
      next: (d: any[]) => { this.prescriptions = d; this.loading = false; },
      error: () => { this.prescriptions = []; this.loading = false; }
    });
  }
  goBack() { this.router.navigate(['/patient-home']); }
}
