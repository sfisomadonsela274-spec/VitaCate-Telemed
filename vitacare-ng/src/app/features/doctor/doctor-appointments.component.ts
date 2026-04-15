import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, PremiumCardComponent, PrimaryButtonComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>All Appointments</h1>
        <button class="icon-btn" (click)="load()" title="Refresh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      <!-- Filter chips -->
      <div class="filter-bar">
        <button *ngFor="let f of filters" class="filter-chip" [class.active]="activeFilter === f" (click)="setFilter(f)">{{ f }}</button>
      </div>

      <div class="page-content">
        <div *ngIf="loading" class="skeleton-list">
          <div class="skeleton-card" *ngFor="let n of [1,2,3,4]"></div>
        </div>

        <div *ngIf="!loading" class="appt-list stagger">
          <div *ngFor="let appt of filtered" class="appt-card" (click)="viewDetail(appt)">
            <div class="appt-avatar">{{ getInitials(appt.patient_name) }}</div>
            <div class="appt-body">
              <strong>{{ appt.patient_name }}</strong>
              <span class="appt-meta">{{ appt.date }} · {{ appt.time || '' }}</span>
              <span class="appt-reason">{{ appt.reason || 'General consultation' }}</span>
            </div>
            <span class="chip" [class]="statusChip(appt.status)">{{ appt.status }}</span>
          </div>
        </div>

        <div *ngIf="!loading && filtered.length === 0" class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>No appointments found</p>
          <span>No {{ activeFilter.toLowerCase() }} appointments</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: var(--background-cream); }
    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface-white); box-shadow: var(--shadow-xs); position: sticky; top: 0; z-index: 10; }
    .page-header h1 { font-size: 1.05rem; color: var(--text-dark); }
    .back-btn, .icon-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; padding: 6px; border-radius: 8px; transition: background 0.2s; }
    .back-btn:hover, .icon-btn:hover { background: var(--primary-pale); }
    .filter-bar { display: flex; gap: 8px; padding: 12px 20px; overflow-x: auto; background: var(--surface-white); border-bottom: 1px solid var(--divider); }
    .filter-chip { padding: 6px 14px; border-radius: 99px; border: 1.5px solid var(--border-light); background: none; color: var(--text-muted); font-size: 0.8rem; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .filter-chip.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .filter-chip:hover:not(.active) { border-color: var(--primary-light); color: var(--primary-color); }
    .page-content { max-width: 560px; margin: 0 auto; padding: 20px; }
    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
    .skeleton-card { height: 80px; border-radius: 16px; background: linear-gradient(90deg, #f0eeeb 25%, #e8e5e1 50%, #f0eeeb 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .appt-list { display: flex; flex-direction: column; gap: 10px; }
    .appt-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--surface-white); border-radius: 16px; padding: 14px 16px;
      box-shadow: var(--shadow-xs); cursor: pointer; transition: box-shadow 0.2s, transform 0.15s;
    }
    .appt-card:hover { box-shadow: var(--shadow-soft); transform: translateY(-1px); }
    .appt-avatar { width: 46px; height: 46px; background: linear-gradient(135deg,#3d5a72,#5b7fa6); border-radius: 14px; color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .appt-body { flex: 1; }
    .appt-body strong { display: block; font-size: 0.91rem; font-weight: 600; color: var(--text-dark); }
    .appt-meta { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .appt-reason { display: block; font-size: 0.73rem; color: var(--text-ultralight); margin-top: 2px; }
    .chip { padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; text-transform: capitalize; }
    .chip-green  { background: rgba(88,112,100,0.1); color: var(--primary-color); }
    .chip-coral  { background: rgba(242,139,131,0.1); color: var(--secondary-dark); }
    .chip-teal   { background: rgba(93,166,158,0.1); color: var(--teal); }
    .empty-state { padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
    .empty-state p { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
    .empty-state span { color: var(--text-ultralight); font-size: 0.8rem; }
  `]
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filtered: any[] = [];
  loading = true;
  filters = ['All', 'Scheduled', 'Completed', 'Pending'];
  activeFilter = 'All';

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getDoctorAppointments().subscribe({
      next: (d: any[]) => { this.appointments = d; this.applyFilter(); this.loading = false; },
      error: () => {
        this.appointments = [
          { id: 1, patient_name: 'Sarah Johnson', date: 'Today', time: '10:00 AM', status: 'scheduled', reason: 'Annual checkup' },
          { id: 2, patient_name: 'Michael Chen', date: 'Today', time: '11:30 AM', status: 'scheduled', reason: 'Follow-up visit' },
          { id: 3, patient_name: 'Amara Ndlovu', date: 'Yesterday', time: '2:00 PM', status: 'completed', reason: 'Chest pain evaluation' },
          { id: 4, patient_name: 'Thabo Sithole', date: 'Tomorrow', time: '9:00 AM', status: 'pending', reason: 'Referral consultation' },
        ];
        this.applyFilter(); this.loading = false;
      }
    });
  }

  setFilter(f: string) { this.activeFilter = f; this.applyFilter(); }
  applyFilter() {
    this.filtered = this.activeFilter === 'All' ? this.appointments : this.appointments.filter(a => a.status?.toLowerCase() === this.activeFilter.toLowerCase());
  }
  getInitials(name: string) { return name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '?'; }
  statusChip(s: string) {
    const m: Record<string, string> = { scheduled: 'chip chip-green', completed: 'chip chip-teal', pending: 'chip chip-coral' };
    return m[s?.toLowerCase()] || 'chip chip-green';
  }
  viewDetail(appt: any) { this.router.navigate(['/appointment-detail']); }
  goBack() { this.router.navigate(['/doctor-home']); }
}
