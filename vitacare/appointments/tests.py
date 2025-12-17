from django.test import TestCase
from .models import Appointment

class AppointmentModelTest(TestCase):
    def test_create_appointment(self):
        # Example test to ensure the Appointment model works
        self.assertTrue(Appointment.objects.count() == 0)
