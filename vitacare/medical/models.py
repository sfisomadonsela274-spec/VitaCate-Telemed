from django.db import models
from users.models import Doctor, CustomUser
from appointments.models import Appointment

class Prescription(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date_issued = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.email} ({self.medication}) by {self.doctor.full_name}"

class Consultation(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    summary = models.TextField()
    date = models.DateField(auto_now_add=True)
    follow_up = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Consultation {self.patient.email} with {self.doctor.full_name} on {self.date}"
