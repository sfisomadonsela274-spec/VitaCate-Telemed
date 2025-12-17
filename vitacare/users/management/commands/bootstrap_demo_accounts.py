from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone

from appointments.models import Appointment
from users.models import Doctor


class Command(BaseCommand):
    """Bootstrap demo doctor, patient and a shared appointment for testing."""

    help = "Create demo doctor & patient accounts plus a shared appointment"

    DOCTOR_EMAIL = "doctor@vitacare.com"
    DOCTOR_PASSWORD = "Doctor123!"
    DOCTOR_LICENSE = "MED123456"
    DOCTOR_NAME = "Dr. Demo"

    PATIENT_EMAIL = "patient@vitacare.com"
    PATIENT_PASSWORD = "Patient123!"
    PATIENT_FIRST_NAME = "Pat"
    PATIENT_LAST_NAME = "Demo"

    def handle(self, *args, **options):
        user_model = get_user_model()

        doctor_user, doctor_user_created = user_model.objects.get_or_create(
            email=self.DOCTOR_EMAIL,
            defaults={
                "first_name": self.DOCTOR_NAME.split()[0],
                "last_name": self.DOCTOR_NAME.split()[-1],
                "role": "doctor",
                "phone": "0710000000",
                "address": "100 Demo Street"
            }
        )
        if doctor_user_created:
            doctor_user.set_password(self.DOCTOR_PASSWORD)
            doctor_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Demo doctor user created"))
        else:
            doctor_user.set_password(self.DOCTOR_PASSWORD)
            doctor_user.save(update_fields=["password"])
            self.stdout.write(self.style.WARNING("• Demo doctor user already existed; password reset"))

        doctor_profile, doctor_created = Doctor.objects.update_or_create(
            email=self.DOCTOR_EMAIL,
            defaults={
                "full_name": self.DOCTOR_NAME,
                "license_number": self.DOCTOR_LICENSE,
                "password": make_password(self.DOCTOR_PASSWORD)
            }
        )
        if doctor_created:
            self.stdout.write(self.style.SUCCESS("✓ Demo doctor profile created"))
        else:
            self.stdout.write(self.style.WARNING("• Demo doctor profile updated"))

        patient_user, patient_created = user_model.objects.get_or_create(
            email=self.PATIENT_EMAIL,
            defaults={
                "first_name": self.PATIENT_FIRST_NAME,
                "last_name": self.PATIENT_LAST_NAME,
                "role": "patient",
                "phone": "0720000000",
                "address": "200 Demo Avenue"
            }
        )
        if patient_created:
            patient_user.set_password(self.PATIENT_PASSWORD)
            patient_user.save()
            self.stdout.write(self.style.SUCCESS("✓ Demo patient created"))
        else:
            patient_user.set_password(self.PATIENT_PASSWORD)
            patient_user.save(update_fields=["password"])
            self.stdout.write(self.style.WARNING("• Demo patient already existed; password reset"))

        appointment_date = timezone.localdate() + timedelta(days=1)
        appointment_time = time(hour=10, minute=0)

        appointment, appointment_created = Appointment.objects.update_or_create(
            doctor=doctor_profile,
            patient=patient_user,
            date=appointment_date,
            time=appointment_time,
            defaults={
                "doctor_name": doctor_profile.full_name,
                "reason": "Demo consultation"
            }
        )

        if appointment_created:
            self.stdout.write(self.style.SUCCESS(
                f"✓ Demo appointment scheduled on {appointment.date} at {appointment.time}"))
        else:
            self.stdout.write(self.style.WARNING(
                f"• Demo appointment already existed for {appointment.date} {appointment.time}; details refreshed"))

        self.stdout.write("\nDemo credentials:")
        self.stdout.write(f" Doctor  -> {self.DOCTOR_EMAIL} / {self.DOCTOR_PASSWORD} (license {self.DOCTOR_LICENSE})")
        self.stdout.write(f" Patient -> {self.PATIENT_EMAIL} / {self.PATIENT_PASSWORD}")
        self.stdout.write(self.style.SUCCESS("All demo data is ready."))
