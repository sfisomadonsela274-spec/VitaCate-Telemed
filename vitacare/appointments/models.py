from django.db import models
from users.models import Doctor, CustomUser

class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    doctor_name = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField()
    reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.patient.email} with {self.doctor_name} on {self.date} at {self.time}"