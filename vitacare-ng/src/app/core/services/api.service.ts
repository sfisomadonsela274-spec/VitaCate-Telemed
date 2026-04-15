import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8000/api';

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

  // Doctor endpoints
  getDoctorDashboard(): Observable<unknown> {
    return this.http.get(`${this.base}/doctor/dashboard/`);
  }
  getDoctorAppointments(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/doctor/appointments/`);
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
