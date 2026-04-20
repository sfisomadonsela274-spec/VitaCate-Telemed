import { Injectable } from '@angular/core';
import { Observable, from, of, Subject, interval } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { supabase } from '../supabase';

export interface VitalRecord {
  id?: string;
  patient_id: string;
  recorded_by?: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class VitalsService {
  constructor() {}

  getVitals(): Observable<VitalRecord[]> {
    return from(
      supabase
        .from('vitals')
        .select('*')
        .order('timestamp', { ascending: false })
    ).pipe(
      map(r => (r.data as VitalRecord[]) ?? []),
      catchError(() => of([]))
    );
  }

  recordVitals(data: Partial<VitalRecord>): Observable<any> {
    return from(
      supabase
        .from('vitals')
        .insert(data)
        .select()
        .single()
    ).pipe(
      map(r => r.data),
      catchError(err => {
        console.error('[VitalsService] Error recording vitals:', err);
        throw err;
      })
    );
  }

  /** Subscribes to real-time updates for a specific patient's vitals */
  subscribeToVitals(patientId: string): Observable<VitalRecord> {
    const subject = new Subject<VitalRecord>();

    const channel = supabase
      .channel(`public:vitals:patient_id=eq.${patientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vitals', filter: `patient_id=eq.${patientId}` },
        (payload) => {
          subject.next(payload.new as VitalRecord);
        }
      )
      .subscribe();

    return subject.asObservable();
  }

  /**
   * Simulates a live stream of vitals data based on the last recorded values
   * Fluctuates slightly to make the bedside dashboard feel 'alive'
   */
  getSimulationStream(): Observable<VitalRecord> {
    const base: VitalRecord = {
       patient_id: '',
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
