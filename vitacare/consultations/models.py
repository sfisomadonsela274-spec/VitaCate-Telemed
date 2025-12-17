from django.db import models
from users.models import Doctor, CustomUser
from appointments.models import Appointment

class Consultation(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='consultations_consultations')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='consultations_patients')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='consultations_appointments', null=True, blank=True)
    summary = models.TextField()
    date = models.DateField(auto_now_add=True)
    follow_up = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Consultation {self.patient.email} with {self.doctor.full_name} on {self.date}"