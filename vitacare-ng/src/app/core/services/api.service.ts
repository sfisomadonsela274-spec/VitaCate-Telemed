import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CONFIG } from '../config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = CONFIG.API_BASE;

  constructor(private http: HttpClient) {}

  // Patient endpoints
  getAppointments(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/appointments/`);
  }
  bookAppointment(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/appointments/`, data);
  }
  getPrescriptions(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/prescriptions/`);
  }
  getConsultations(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/consultations/`);
  }
  getPatientDashboard(): Observable<unknown> {
    return this.http.get(`${this.base}/patient/dashboard/`);
  }
  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/patients/`);
  }

  // Doctor endpoints
  getDoctorDashboard(): Observable<unknown> {
    return this.http.get(`${this.base}/doctor/dashboard/`);
  }
  getDoctorAppointments(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/doctor/appointments/doctor-list/`);
  }
  addPrescription(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/prescriptions/`, data);
  }
  addConsultation(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/consultations/`, data);
  }
  getDoctors(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/doctors/`);
  }
}
