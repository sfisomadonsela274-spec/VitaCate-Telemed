import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="vita-btn tap-button"
      [class.full]="fullWidth"
      [class.outline]="variant === 'outline'"
      [class.ghost]="variant === 'ghost'"
      [class.danger]="variant === 'danger'"
      [class.loading]="loading"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)">
      <span class="spinner" *ngIf="loading"></span>
      <ng-content *ngIf="!loading"></ng-content>
      <span *ngIf="loading">Processing...</span>
    </button>
  `,
  styles: [`
    .vita-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 12px;
      background: var(--primary-color);
      color: var(--surface-white);
      border-radius: var(--radius-md);
      padding: 0 32px;
      font-size: 1rem; font-weight: 700;
      letter-spacing: -0.01em;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-soft);
      border: 2px solid transparent;
      white-space: nowrap;
    }
    
    .vita-btn:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-premium);
    }
    
    .vita-btn:active:not(:disabled) { 
      transform: scale(0.97); 
      box-shadow: var(--shadow-xs);
    }
    
    .vita-btn:disabled { 
      opacity: 0.4; cursor: not-allowed; 
      filter: grayscale(0.5);
    }
    
    .vita-btn.full { width: 100%; }
    
    .vita-btn.outline {
      background: transparent;
      color: var(--primary-color);
      border-color: var(--primary-color);
      box-shadow: none;
    }
    .vita-btn.outline:hover:not(:disabled) { background: var(--primary-pale); }
    
    .vita-btn.ghost {
      background: transparent; color: var(--primary-color); box-shadow: none;
    }
    .vita-btn.ghost:hover:not(:disabled) { background: var(--primary-pale); }
    
    .vita-btn.danger { 
      background: var(--error); 
      box-shadow: 0 8px 24px rgba(214, 48, 49, 0.2); 
    }
    .vita-btn.danger:hover:not(:disabled) { background: #b32424; }
    
    .vita-btn.loading { opacity: 0.8; }
    
    .spinner {
      width: 18px; height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PrimaryButtonComponent {
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() loading = false;
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Output() onClick = new EventEmitter<Event>();
}
