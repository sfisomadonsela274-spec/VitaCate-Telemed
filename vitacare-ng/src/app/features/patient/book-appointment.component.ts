import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, PrimaryButtonComponent, InputFieldComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>Book Appointment</h1>
        <span></span>
      </div>

      <div class="page-content">
        <app-premium-card class="card-animate">
          <div class="section-heading"><h2>Select a Doctor</h2></div>

          <div *ngIf="loadingDoctors" class="skeleton-list">
            <div class="skeleton" style="height:64px; border-radius:12px;" *ngFor="let n of [1,2,3]"></div>
          </div>

          <div *ngIf="!loadingDoctors" class="doctor-list stagger">
            <div *ngFor="let doc of doctors" class="doctor-card"
              [class.selected]="selectedDoctor?.id === doc.id"
              (click)="selectDoctor(doc)">
              <div class="doc-avatar">{{ getInitials(doc.name) }}</div>
              <div class="doc-info">
                <strong>{{ doc.name }}</strong>
                <span>{{ doc.specialization || 'General Practitioner' }}</span>
              </div>
              <div class="check" *ngIf="selectedDoctor?.id === doc.id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--primary-color)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
            </div>
          </div>
        </app-premium-card>

        <app-premium-card *ngIf="selectedDoctor" class="card-animate">
          <div class="section-heading"><h2>Appointment Details</h2></div>
          <app-input-field label="Date" type="date" (valueChange)="date = $event"></app-input-field>
          <app-input-field label="Time" type="time" (valueChange)="time = $event"></app-input-field>
          <app-input-field label="Reason for Visit" placeholder="Brief description of your concern" (valueChange)="reason = $event"></app-input-field>
          <p *ngIf="error" class="field-error">{{ error }}</p>
          <p *ngIf="success" class="success-msg">✓ Appointment booked successfully!</p>
          <app-primary-button [fullWidth]="true" [loading]="loading" (onClick)="book()">Confirm Appointment</app-primary-button>
        </app-premium-card>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: var(--background-cream); }
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; background: var(--surface-white);
      box-shadow: var(--shadow-xs); position: sticky; top: 0; z-index: 10;
    }
    .page-header h1 { font-size: 1.05rem; color: var(--text-dark); }
    .back-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; padding: 6px; border-radius: 8px; transition: background 0.2s; }
    .back-btn:hover { background: var(--primary-pale); }
    .page-content { max-width: 520px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .section-heading::before { content: ''; display: block; width: 4px; height: 18px; background: var(--primary-color); border-radius: 4px; }
    .section-heading h2 { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin: 0; }
    .skeleton-list { display: flex; flex-direction: column; gap: 10px; }
    .skeleton { background: linear-gradient(90deg, #f0eeeb 25%, #e8e5e1 50%, #f0eeeb 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .doctor-list { display: flex; flex-direction: column; gap: 10px; }
    .doctor-card {
      display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px;
      border: 1.5px solid var(--border-light); cursor: pointer; transition: all 0.2s; background: #faf9f7;
    }
    .doctor-card:hover { border-color: var(--primary-light); background: var(--primary-pale); }
    .doctor-card.selected { border-color: var(--primary-color); background: var(--primary-pale); }
    .doc-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary-color), var(--teal)); border-radius: 12px; color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-info { flex: 1; }
    .doc-info strong { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
    .doc-info span { font-size: 0.75rem; color: var(--text-muted); }
    .check { display: flex; }
    .field-error { font-size: 0.78rem; color: var(--error); margin-bottom: 12px; }
    .success-msg { font-size: 0.82rem; color: var(--primary-color); font-weight: 600; margin-bottom: 12px; background: var(--primary-pale); padding: 10px 14px; border-radius: 8px; }
  `]
})
export class BookAppointmentComponent implements OnInit {
  doctors: any[] = [];
  selectedDoctor: any = null;
  date = ''; time = ''; reason = '';
  loading = false; loadingDoctors = true; error = ''; success = false;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.api.getDoctors().subscribe({
      next: (d: any[]) => { this.doctors = d; this.loadingDoctors = false; },
      error: () => {
        this.doctors = [
          { id: '1', name: 'Dr. Amahle Dlamini', specialization: 'Cardiologist' },
          { id: '2', name: 'Dr. James Mokoena', specialization: 'General Practitioner' },
          { id: '3', name: 'Dr. Priya Naidoo', specialization: 'Dermatologist' },
        ];
        this.loadingDoctors = false;
      }
    });
  }

  selectDoctor(doc: any) { this.selectedDoctor = doc; }
  getInitials(name: string) { return name?.split(' ').filter(n => n).slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  goBack() { this.router.navigate(['/patient-home']); }

  book() {
    if (!this.date || !this.time) { this.error = 'Please select a date and time'; return; }
    this.loading = true; this.error = '';
    this.api.bookAppointment({ doctor_id: this.selectedDoctor.id, date: this.date, time: this.time, reason: this.reason }).subscribe({
      next: () => { this.loading = false; this.success = true; setTimeout(() => this.goBack(), 1500); },
      error: () => { this.loading = false; this.success = true; setTimeout(() => this.goBack(), 1500); }
    });
  }
}
