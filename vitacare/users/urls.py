from django.urls import path
from .views import DoctorLoginView
from .views import get_doctor_id
from .views import (
    RegisterView,
    LoginAPIView,
    ForgotPasswordView,
    VerifyResetCodeView,
    ResetPasswordView,
    MeView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-code/', VerifyResetCodeView.as_view(), name='verify-code'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('me/', MeView.as_view(), name='me'),
    path('doctor/login/', DoctorLoginView.as_view(), name='doctor-login'),
    path('doctor-id/', get_doctor_id),
]