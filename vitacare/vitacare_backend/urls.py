from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView  # Import your actual register view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Added missing comma
    path('api/appointments/', include('appointments.urls')),  # Added missing comma
    path('api/prescriptions/', include('prescriptions.urls')),  # Added missing comma
    path('api/consultations/', include('consultations.urls')),  # Added missing comma
    path('api/medical/', include('medical.urls')),  # Added missing comma
    
    # JWT Authentication endpoints
    path('api/users/register/', RegisterView.as_view(), name='register'),  # Fixed this line
    path('api/users/login/', TokenObtainPairView.as_view(), name='login'),  # Fixed this line
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Fixed this line
]