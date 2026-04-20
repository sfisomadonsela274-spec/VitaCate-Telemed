import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { supabase } from '../supabase';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor() {}

  // ─── Appointments ────────────────────────────────────────────

  getAppointments(): Observable<any[]> {
    return from(
      supabase
        .from('appointments')
        .select('*, doctors(full_name), profiles(id, first_name, last_name)')
        .order('date', { ascending: false })
    ).pipe(map(r => r.data ?? []));
  }

  bookAppointment(data: {
    doctor_id: string;
    date: string;
    time: string;
    reason?: string;
  }): Observable<any> {
    return from(
      supabase.functions.invoke('book-appointment', { body: data })
    ).pipe(
      switchMap(({ data: result, error }) => {
        if (error) throw error;
        return of(result);
      }),
      catchError(err => { throw err; })
    );
  }

  getMyLatestAppointment(): Observable<any> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()
    ).pipe(map(r => r.data));
  }

  getDoctorAppointments(doctorId: string): Observable<any[]> {
    return from(
      supabase
        .from('appointments')
        .select('*, profiles(first_name, last_name)')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false })
    ).pipe(map(r => r.data ?? []));
  }

  completeAppointment(appointmentId: string): Observable<any> {
    return from(
      supabase.functions.invoke('complete-appointment', {
        body: { appointment_id: appointmentId }
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        return of(data);
      }),
      catchError(err => { throw err; })
    );
  }

  // ─── Doctors ─────────────────────────────────────────────────

  getDoctors(): Observable<any[]> {
    return from(
      supabase.from('doctors').select('*')
    ).pipe(map(r => r.data ?? []));
  }

  getDoctorId(email: string): Observable<string | null> {
    return from(
      supabase
        .from('doctors')
        .select('id')
        .eq('email', email)
        .single()
    ).pipe(
      map(r => r.data?.id ?? null),
      catchError(() => of(null))
    );
  }

  // ─── Prescriptions ───────────────────────────────────────────

  getPrescriptions(): Observable<any[]> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('prescriptions')
        .select('*, doctors(full_name)')
        .eq('patient_id', userId)
        .order('date_issued', { ascending: false })
    ).pipe(map(r => r.data ?? []));
  }

  addPrescription(data: {
    doctor_id: string;
    patient_id: string;
    appointment_id?: string;
    medication: string;
    dosage: string;
    notes?: string;
  }): Observable<any> {
    return from(
      supabase.functions.invoke('add-prescription', { body: data })
    ).pipe(
      switchMap(({ data: result, error }) => {
        if (error) throw error;
        return of(result);
      }),
      catchError(err => { throw err; })
    );
  }

  // ─── Consultations ──────────────────────────────────────────

  getConsultations(): Observable<any[]> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('consultations')
        .select('*, doctors(full_name)')
        .eq('patient_id', userId)
        .order('date', { ascending: false })
    ).pipe(map(r => r.data ?? []));
  }

  addConsultation(data: {
    doctor_id: string;
    patient_id: string;
    appointment_id?: string;
    summary: string;
    follow_up?: string;
  }): Observable<any> {
    return from(
      supabase.functions.invoke('add-consultation', { body: data })
    ).pipe(
      switchMap(({ data: result, error }) => {
        if (error) throw error;
        return of(result);
      }),
      catchError(err => { throw err; })
    );
  }

  // ─── Vitals ──────────────────────────────────────────────────

  getVitals(): Observable<any[]> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('vitals')
        .select('*, doctors(full_name)')
        .eq('patient_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20)
    ).pipe(map(r => r.data ?? []));
  }

  recordVitals(data: {
    heart_rate: number;
    spo2: number;
    temperature: number;
    systolic: number;
    diastolic: number;
  }): Observable<any> {
    return from(
      supabase
        .from('vitals')
        .insert({ ...data, patient_id: this.getCurrentUserId() })
        .select()
        .single()
    ).pipe(
      switchMap(r => r.error ? Promise.reject(r.error) : of(r.data)),
      catchError(err => { throw err; })
    );
  }

  // ─── Patients / Dashboard ────────────────────────────────────

  getPatients(): Observable<any[]> {
    return from(
      supabase
        .from('profiles')
        .select('id, email, first_name, last_name, phone')
        .eq('role', 'patient')
    ).pipe(map(r => r.data ?? []));
  }

  getPatientDashboard(): Observable<any> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    ).pipe(
      switchMap(r => r.error ? Promise.reject(r.error) : of(r.data)),
      catchError(err => { throw err; })
    );
  }

  getDoctorDashboard(): Observable<any> {
    const userId = this.getCurrentUserId();
    return from(
      supabase
        .from('doctors')
        .select('*')
        .eq('id', userId)
        .single()
    ).pipe(
      switchMap(r => r.error ? Promise.reject(r.error) : of(r.data)),
      catchError(err => { throw err; })
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private getCurrentUserId(): string {
    // Access from localStorage tokens set by auth service
    try {
      const tokens = JSON.parse(localStorage.getItem('vitacare_tokens') || '{}');
      return tokens.user_id || '';
    } catch { return ''; }
  }
}
