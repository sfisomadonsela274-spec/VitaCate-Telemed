from django.urls import path
from .views import (
    PatientPrescriptionsView, DoctorCreatePrescriptionView,
    PatientConsultationsView, DoctorCreateConsultationView
)

urlpatterns = [
    path('prescriptions/my/', PatientPrescriptionsView.as_view(), name='patient_prescriptions'),
    path('prescriptions/create/', DoctorCreatePrescriptionView.as_view(), name='doctor_create_prescription'),
    path('consultations/my/', PatientConsultationsView.as_view(), name='patient_consultations'),
    path('consultations/create/', DoctorCreateConsultationView.as_view(), name='doctor_create_consultation'),
]