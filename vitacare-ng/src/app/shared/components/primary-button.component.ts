import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="vita-btn"
      [class.full]="fullWidth"
      [class.outline]="variant === 'outline'"
      [class.ghost]="variant === 'ghost'"
      [class.danger]="variant === 'danger'"
      [class.loading]="loading"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)">
      <span class="spinner" *ngIf="loading"></span>
      <ng-content *ngIf="!loading"></ng-content>
      <span *ngIf="loading">Please wait…</span>
    </button>
  `,
  styles: [`
    .vita-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--primary-color);
      color: var(--surface-white);
      border-radius: var(--radius-full);
      padding: 13px 28px;
      font-size: 0.9rem; font-weight: 600;
      letter-spacing: 0.01em;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(88,112,100,0.25);
    }
    .vita-btn:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(88,112,100,0.3);
    }
    .vita-btn:active:not(:disabled) { transform: translateY(1px); box-shadow: none; }
    .vita-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .vita-btn.full { width: 100%; }
    .vita-btn.outline {
      background: transparent;
      color: var(--primary-color);
      border: 1.5px solid var(--primary-color);
      box-shadow: none;
    }
    .vita-btn.outline:hover:not(:disabled) { background: var(--primary-pale); }
    .vita-btn.ghost {
      background: transparent; color: var(--primary-color); box-shadow: none;
    }
    .vita-btn.ghost:hover:not(:disabled) { background: var(--primary-pale); }
    .vita-btn.danger { background: var(--error); box-shadow: 0 4px 12px rgba(225,90,90,0.25); }
    .vita-btn.danger:hover:not(:disabled) { background: #c94545; }
    .vita-btn.loading { pointer-events: none; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
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
