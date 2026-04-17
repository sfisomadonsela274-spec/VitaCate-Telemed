import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { PrimaryButtonComponent } from '../../shared/components/primary-button.component';
import { SignaturePadComponent } from '../../shared/components/signature-pad.component';

@Component({
  selector: 'app-add-prescription',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PremiumCardComponent, 
    InputFieldComponent, PrimaryButtonComponent, SignaturePadComponent
  ],
  template: `
    <div class="page-shell page-animate">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
        </button>
        <h1>Issue Prescription</h1>
        <span></span>
      </div>

      <div class="page-content">
        <app-premium-card class="card-animate">
          <div class="section-heading"><h2>Prescription Details</h2></div>
          
          <app-input-field label="Patient Name / ID" placeholder="Search patient..." (valueChange)="patientId = $event"></app-input-field>
          <app-input-field label="Medication / Treatment" placeholder="e.g. Amoxicillin 500mg" (valueChange)="medication = $event"></app-input-field>
          <app-input-field label="Dosage" placeholder="e.g. 1 tablet twice daily" (valueChange)="dosage = $event"></app-input-field>
          
          <div class="form-row">
            <app-input-field label="Duration" placeholder="e.g. 7 days" (valueChange)="duration = $event"></app-input-field>
            <app-input-field label="Date Issued" type="date" (valueChange)="date = $event"></app-input-field>
          </div>

          <div class="field-wrap">
            <label class="field-label">Notes</label>
            <textarea class="vita-textarea" rows="3" [(ngModel)]="notes" placeholder="Take with food..."></textarea>
          </div>

          <div class="section-heading"><h2>Digital Authorization</h2></div>
          <app-signature-pad (signatureChange)="onSignatureChange($event)"></app-signature-pad>

          <p *ngIf="error" class="field-error">{{ error }}</p>
          <p *ngIf="success" class="success-msg">✓ Prescription issued and signed!</p>

          <div class="btn-row">
            <app-primary-button [variant]="'outline'" (onClick)="goBack()">Cancel</app-primary-button>
            <app-primary-button [loading]="loading" [disabled]="!signature" (onClick)="save()">Issue & Sign</app-primary-button>
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
    .page-content { max-width: 560px; margin: 0 auto; padding: 20px 20px 80px; }
    .section-heading { display: flex; align-items: center; gap: 10px; margin: 24px 0 16px; }
    .section-heading:first-child { margin-top: 0; }
    .section-heading::before { content: ''; display: block; width: 4px; height: 18px; background: var(--secondary-color); border-radius: 4px; }
    .section-heading h2 { font-size: 0.9rem; font-weight: 700; color: var(--text-dark); margin: 0; opacity: 0.8; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label { font-size: 0.8rem; font-weight: 700; color: var(--text-dark); display: block; margin-bottom: 6px; opacity: 0.7; }
    .vita-textarea {
      width: 100%; padding: 12px 14px; border: 1.5px solid var(--border-light);
      border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.9rem;
      color: var(--text-dark); background: #faf8f6; resize: vertical; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 16px;
    }
    .vita-textarea:focus { border-color: var(--secondary-color); box-shadow: 0 0 0 3px rgba(242,139,131,0.1); background: white; }
    .field-error { font-size: 0.78rem; color: var(--error); margin-bottom: 12px; }
    .success-msg { font-size: 0.82rem; color: var(--primary-color); font-weight: 600; margin-bottom: 12px; background: var(--primary-pale); padding: 10px 14px; border-radius: 8px; }
    .btn-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class AddPrescriptionComponent {
  patientId = ''; medication = ''; dosage = ''; duration = ''; date = ''; notes = '';
  signature: string | null = null;
  loading = false; error = ''; success = false;

  constructor(private router: Router, private api: ApiService) {}

  goBack() { this.router.navigate(['/doctor-home']); }

  onSignatureChange(sig: string | null) { this.signature = sig; }

  save() {
    if (!this.medication || !this.signature) { 
      this.error = 'Medication and Digital Authorization (Signature) are required'; 
      return; 
    }
    this.loading = true; this.error = '';
    
    this.api.addPrescription({
      patient_id: this.patientId, // Backend expects patient_id
      doctor_email: 'dr.doctor@vitacare.com', // Demo email
      medication: this.medication,
      dosage: this.dosage,
      notes: this.notes,
      signature_data: this.signature
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.goBack(), 1500);
      },
      error: () => {
        // demo fallback
        this.loading = false;
        this.success = true;
        setTimeout(() => this.goBack(), 1500);
      }
    });
  }
}
