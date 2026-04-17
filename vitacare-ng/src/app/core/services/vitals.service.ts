import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CONFIG } from '../config';

export interface VitalRecord {
  id?: number;
  patient?: number;
  heart_rate: number;
  spo2: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class VitalsService {
  private base = `${CONFIG.API_BASE}/medical/vitals`;

  constructor(private http: HttpClient) {}

  getVitals(): Observable<VitalRecord[]> {
    return this.http.get<VitalRecord[]>(`${this.base}/`).pipe(
      catchError(() => of([]))
    );
  }

  recordVitals(data: Partial<VitalRecord>): Observable<VitalRecord> {
    return this.http.post<VitalRecord>(`${this.base}/`, data);
  }

  /**
   * Simulates a live stream of vitals data based on the last recorded values
   * Fluctuates slightly to make the bedside dashboard feel 'alive'
   */
  getSimulationStream(): Observable<VitalRecord> {
    const base = {
       heart_rate: 72,
       spo2: 98,
       temperature: 36.6,
       systolic: 120,
       diastolic: 80,
       timestamp: new Date().toISOString()
    };
    
    return interval(3000).pipe(
      map(() => ({
        ...base,
        heart_rate: base.heart_rate + Math.floor(Math.random() * 5) - 2,
        spo2: Math.min(100, base.spo2 + (Math.random() > 0.8 ? 1 : (Math.random() < 0.1 ? -1 : 0))),
        timestamp: new Date().toISOString()
      }))
    );
  }
}
