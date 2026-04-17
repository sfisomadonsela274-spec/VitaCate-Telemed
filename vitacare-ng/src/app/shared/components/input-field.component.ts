import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="field-wrap">
      <label *ngIf="label" class="field-label">{{ label }}</label>
      <div class="input-shell" [class.focused]="isFocused" [class.has-error]="!!error" [class.disabled]="disabled">
        <span *ngIf="iconSvg" class="input-icon" [innerHTML]="iconSvg"></span>
        <input
          [type]="showPassword ? 'text' : type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
          (input)="onInput($event)"
        />
        <button *ngIf="type === 'password'" type="button" class="toggle-pw" (click)="showPassword = !showPassword">
          <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
      <span *ngIf="error" class="field-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    .field-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .field-label { font-size: 0.85rem; font-weight: 600; color: var(--primary-dark); padding-left: 4px; }
    .input-shell {
      display: flex; align-items: center; gap: 12px;
      padding: 0 18px;
      background: var(--surface-white);
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      height: var(--min-tap-target);
      box-shadow: var(--shadow-xs);
    }
    .input-shell.focused {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 4px var(--primary-pale);
      background: #ffffff;
    }
    .input-shell.has-error { border-color: var(--error); background: rgba(214, 48, 49, 0.02); }
    .input-shell.disabled { opacity: 0.5; cursor: not-allowed; background: var(--background-cream); }
    .input-icon { display: flex; align-items: center; color: var(--primary-light); flex-shrink: 0; }
    input {
      flex: 1; border: none; background: transparent; outline: none;
      font-size: 1rem; color: var(--text-dark);
      font-family: var(--font-body);
    }
    input::placeholder { color: var(--text-ultralight); }
    .toggle-pw {
      background: none; border: none; padding: 6px;
      color: var(--text-muted); cursor: pointer; display: flex;
      border-radius: 8px; transition: color 0.2s;
    }
    .toggle-pw:hover { color: var(--primary-color); }
    .field-error { font-size: 0.75rem; color: var(--error); font-weight: 500; margin-top: 4px; padding-left: 4px; }
  `]
})
export class InputFieldComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() disabled = false;
  @Input() error = '';
  @Input() iconSvg = '';

  @Output() valueChange = new EventEmitter<string>();

  isFocused = false;
  showPassword = false;

  onInput(e: Event) {
    this.valueChange.emit((e.target as HTMLInputElement).value);
  }
}
