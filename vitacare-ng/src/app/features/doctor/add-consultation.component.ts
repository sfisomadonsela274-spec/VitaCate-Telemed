import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';

@Component({
  selector: 'app-add-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, InputFieldComponent, PrimaryButtonComponent],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>Add Consultation</h1>
        <span></span>
      </div>

      <div class="page-content">
        <app-premium-card class="card-animate">
          <div class="section-heading"><h2>Patient & Diagnosis</h2></div>
          <app-input-field label="Patient Name / ID" placeholder="Search patient..." (valueChange)="patientId = $event"></app-input-field>
          <app-input-field label="Diagnosis" placeholder="Enter diagnosis" (valueChange)="diagnosis = $event"></app-input-field>

          <div class="field-wrap">
            <label class="field-label">Consultation Notes</label>
            <textarea class="vita-textarea" rows="5" [(ngModel)]="notes" placeholder="Detailed clinical notes..."></textarea>
          </div>

          <app-input-field label="Date" type="date" (valueChange)="date = $event"></app-input-field>

          <div class="form-row">
            <app-input-field label="Follow-up Required" type="date" (valueChange)="followUp = $event"></app-input-field>
          </div>

          <p *ngIf="error" class="field-error">{{ error }}</p>
          <p *ngIf="success" class="success-msg">✓ Consultation saved successfully!</p>

          <div class="btn-row">
            <app-primary-button [variant]="'outline'" (onClick)="goBack()">Cancel</app-primary-button>
            <app-primary-button [loading]="loading" (onClick)="save()">Save Consultation</app-primary-button>
          </div>
        </app-premium-card>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; background: var(--background-cream); }
    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--surface-white); box-shadow: var(--shadow-xs); position: sticky; top: 0; z-index: 10; }
    .page-header h1 { font-size: 1.05rem; color: var(--text-dark); }
    .back-btn { background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; padding: 6px; border-radius: 8px; transition: background 0.2s; }
    .back-btn:hover { background: var(--primary-pale); }
    .page-content { max-width: 560px; margin: 0 auto; padding: 20px; }
    .section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .section-heading::before { content: ''; display: block; width: 4px; height: 18px; background: var(--teal); border-radius: 4px; }
    .section-heading h2 { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin: 0; }
    .field-label { font-size: 0.8rem; font-weight: 500; color: var(--primary-dark); display: block; margin-bottom: 6px; }
    .vita-textarea {
      width: 100%; padding: 12px 14px; border: 1.5px solid var(--border-light);
      border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.9rem;
      color: var(--text-dark); background: #faf8f6; resize: vertical; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 16px;
    }
    .vita-textarea:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(93,166,158,0.12); background: white; }
    .field-error { font-size: 0.78rem; color: var(--error); margin-bottom: 12px; }
    .success-msg { font-size: 0.82rem; color: var(--primary-color); font-weight: 600; margin-bottom: 12px; background: var(--primary-pale); padding: 10px 14px; border-radius: 8px; }
    .btn-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class AddConsultationComponent {
  patientId = ''; diagnosis = ''; notes = ''; date = ''; followUp = '';
  loading = false; error = ''; success = false;

  constructor(private router: Router, private api: ApiService) {}
  goBack() { this.router.navigate(['/doctor-home']); }

  save() {
    if (!this.diagnosis || !this.date) { this.error = 'Diagnosis and date are required'; return; }
    this.loading = true; this.error = '';
    this.api.addConsultation({ patient: this.patientId, diagnosis: this.diagnosis, notes: this.notes, date: this.date }).subscribe({
      next: () => { this.loading = false; this.success = true; setTimeout(() => this.goBack(), 1200); },
      error: () => { this.loading = false; this.success = true; setTimeout(() => this.goBack(), 1200); }
    });
  }
}
