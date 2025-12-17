from django.db import models
from users.models import Doctor, CustomUser
from appointments.models import Appointment

class Prescription(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions_doctors')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='prescriptions_patients')
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='prescriptions_appointments', null=True, blank=True)
    medication = models.CharField(max_length=255, blank=True, default="")
    dosage = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    date_issued = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.email} by {self.doctor.full_name}"