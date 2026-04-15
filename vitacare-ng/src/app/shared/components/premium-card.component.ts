import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-premium-card',
  standalone: true,
  template: `<div class="vitacard" [class.hover]="hoverEffect"><ng-content></ng-content></div>`,
  styles: [`
    .vitacard {
      background: var(--surface-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-soft);
      padding: 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .vitacard.hover:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-premium);
    }
  `]
})
export class PremiumCardComponent {
  @Input() hoverEffect = false;
}
