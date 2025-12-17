from django.urls import path
from . import views

urlpatterns = [
    path('prescriptions/add/', views.add_prescription),
    path('consultations/add/', views.add_consultation),
    path('prescriptions/my/', views.my_prescriptions),
    path('consultations/my/', views.my_consultations),
]