from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/appointments/', include('appointments.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/medical/', include('medical.urls')),
    # optional: auth endpoints for browsable API / session login
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # ...existing url patterns...
]
