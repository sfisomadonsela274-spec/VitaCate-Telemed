from django.urls import path
from .views import PatientConsultationListView, DoctorCreateConsultationView

urlpatterns = [
    path('my/', PatientConsultationListView.as_view(), name='patient_consultations'),
    path('create/', DoctorCreateConsultationView.as_view(), name='doctor_create_consultation'),
]