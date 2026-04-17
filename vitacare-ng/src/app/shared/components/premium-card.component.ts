import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-premium-card',
  standalone: true,
  template: `<div class="vitacard" [class.hover]="hoverEffect"><ng-content></ng-content></div>`,
  styles: [``]
})
export class PremiumCardComponent {
  @Input() hoverEffect = false;
}
