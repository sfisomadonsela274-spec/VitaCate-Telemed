from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import DoctorListView, PatientListView
from appointments.views import DoctorAppointmentsListView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/appointments/', include('appointments.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/medical/', include('medical.urls')),
    path('api/chat/', include('chat.urls')),
    # Convenience top-level shortcuts
    path('api/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('api/patients/', PatientListView.as_view(), name='patient-list'),
    path('api/doctor/appointments/', include('appointments.urls')),
    # optional: auth endpoints for browsable API / session login
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
