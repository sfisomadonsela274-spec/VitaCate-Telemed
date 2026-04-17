import { Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-container">
      <div class="canvas-header">
         <label>Patient/Doctor Signature</label>
         <button type="button" class="clear-btn" (click)="clear()">Clear</button>
      </div>
      <div class="canvas-wrap">
        <canvas #sigCanvas height="180" (mousedown)="startDrawing($event)" (mousemove)="draw($event)" (mouseup)="stopDrawing()" (mouseleave)="stopDrawing()" (touchstart)="startDrawing($event)" (touchmove)="draw($event)" (touchend)="stopDrawing()"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .signature-container { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
    .canvas-header { display: flex; justify-content: space-between; align-items: center; }
    .canvas-header label { font-size: 0.85rem; font-weight: 700; color: var(--text-dark); opacity: 0.7; }
    .clear-btn { background: none; border: none; color: var(--error); font-size: 0.75rem; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
    .clear-btn:hover { background: rgba(214, 48, 49, 0.05); }
    
    .canvas-wrap {
      border: 2px dashed var(--border-light);
      background: var(--surface-white);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: crosshair;
      touch-action: none;
    }
    
    canvas { display: block; width: 100%; border-radius: var(--radius-md); transition: background 0.2s; }
    .canvas-wrap:active { background: #fcfdfc; }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('sigCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureChange = new EventEmitter<string | null>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.ctx.strokeStyle = '#2d3436';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 400;
  }

  startDrawing(e: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const pos = this.getPosition(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    const pos = this.getPosition(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.emitChange();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureChange.emit(null);
  }

  private getPosition(e: MouseEvent | TouchEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  private emitChange() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.signatureChange.emit(dataUrl);
  }
}
