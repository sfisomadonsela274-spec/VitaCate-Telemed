from django.db import models
from users.models import Doctor, CustomUser
from appointments.models import Appointment

class Prescription(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    medication = models.CharField(max_length=255)
    dosage = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    signature_data = models.TextField(blank=True, null=True) # Base64 ink data
    date_issued = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.email} ({self.medication})"

class Vitals(models.Model):
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='vitals')
    recorded_by = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True)
    heart_rate = models.IntegerField()
    spo2 = models.IntegerField()
    temperature = models.FloatField(default=36.6)
    systolic = models.IntegerField(default=120)
    diastolic = models.IntegerField(default=80)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Vitals"

    def __str__(self):
        return f"Vitals for {self.patient.email} at {self.timestamp}"

class Consultation(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    summary = models.TextField()
    date = models.DateField(auto_now_add=True)
    follow_up = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Consultation {self.patient.email} with {self.doctor.full_name} on {self.date}"
