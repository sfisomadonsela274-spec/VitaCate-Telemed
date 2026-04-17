import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-vitals-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 180px; margin-top: 12px; }
    canvas { display: block; width: 100%; height: 100%; }
  `]
})
export class VitalsChartComponent implements OnInit, OnChanges {
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: { label: string, value: number, color: string }[] = [];
  @Input() type: 'line' | 'bar' = 'line';
  @Input() history: { x: any, y: number }[] = [];
  @Input() label = 'Pulse (BPM)';
  @Input() color = '#4A6759';

  private chart: Chart | null = null;

  ngOnInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart && (changes['history'] || changes['data'])) {
      this.updateChart();
    }
  }

  private initChart() {
    const config: ChartConfiguration = {
      type: this.type,
      data: {
        datasets: [{
          label: this.label,
          data: this.history,
          borderColor: this.color,
          backgroundColor: this.color + '20', // Add transparency for the fill
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { display: false },
          y: { 
            display: true, 
            grid: { color: '#f1f1f1' },
            ticks: { font: { size: 10 }, color: '#94a3b8' }
          }
        }
      }
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }

  private updateChart() {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = this.history;
    this.chart.update('none'); // No animation for live updates to save CPU
  }
}
