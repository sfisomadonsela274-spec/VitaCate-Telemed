import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Auth ─────────────────────────────────────────────────
  { path: 'welcome',
    loadComponent: () => import('./features/auth/welcome.component').then(m => m.WelcomeComponent) },
  { path: 'patient-login',
    loadComponent: () => import('./features/auth/patient-login.component').then(m => m.PatientLoginComponent) },
  { path: 'doctor-login',
    loadComponent: () => import('./features/auth/doctor-login.component').then(m => m.DoctorLoginComponent) },
  { path: 'signup',
    loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent) },
  { path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },

  // ── Patient ───────────────────────────────────────────────
  { path: 'patient-home',
    loadComponent: () => import('./features/patient/patient-home.component').then(m => m.PatientHomeComponent) },
  { path: 'book-appointment',
    loadComponent: () => import('./features/patient/book-appointment.component').then(m => m.BookAppointmentComponent) },
  { path: 'patient-prescriptions',
    loadComponent: () => import('./features/patient/patient-prescriptions.component').then(m => m.PatientPrescriptionsComponent) },
  { path: 'patient-consultations',
    loadComponent: () => import('./features/patient/patient-consultations.component').then(m => m.PatientConsultationsComponent) },
  { path: 'patient-chat',
    loadComponent: () => import('./features/chat/patient-chat.component').then(m => m.PatientChatComponent) },
  { path: 'video-call/:id',
    loadComponent: () => import('./features/video/video-call.component').then(m => m.VideoCallComponent) },

  // ── Doctor ────────────────────────────────────────────────
  { path: 'doctor-home',
    loadComponent: () => import('./features/doctor/doctor-home.component').then(m => m.DoctorHomeComponent) },
  { path: 'doctor-appointments',
    loadComponent: () => import('./features/doctor/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent) },
  { path: 'appointment-detail',
    loadComponent: () => import('./features/doctor/appointment-detail.component').then(m => m.AppointmentDetailComponent) },
  { path: 'add-consultation',
    loadComponent: () => import('./features/doctor/add-consultation.component').then(m => m.AddConsultationComponent) },
  { path: 'add-prescription',
    loadComponent: () => import('./features/doctor/add-prescription.component').then(m => m.AddPrescriptionComponent) },
  { path: 'doctor-chat',
    loadComponent: () => import('./features/chat/doctor-chat.component').then(m => m.DoctorChatComponent) },

  // ── Redirects ─────────────────────────────────────────────
  { path: '',   redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome' }
];
