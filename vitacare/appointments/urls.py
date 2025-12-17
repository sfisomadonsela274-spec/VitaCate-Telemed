from django.urls import path
from .views import (
    BookAppointmentView,
    MyLatestAppointmentView,
    DoctorAppointmentsListView,

    CompleteAppointmentView,
    AppointmentDetailView  # Added missing import
)

urlpatterns = [
    path('book/', BookAppointmentView.as_view(), name='book_appointment'),
    path('my-latest/', MyLatestAppointmentView.as_view(), name='my_latest_appointment'),
    path('doctor-list/', DoctorAppointmentsListView.as_view(), name='doctor_appointments_list'),
    path('detail/', AppointmentDetailView.as_view(), name='appointment_detail'),
    path('complete/<int:appointment_id>/', CompleteAppointmentView.as_view(), name='complete_appointment'),
]
