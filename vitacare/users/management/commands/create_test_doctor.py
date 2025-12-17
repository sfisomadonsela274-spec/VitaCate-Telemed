from django.core.management.base import BaseCommand
from users.models import CustomUser, Doctor
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Create a test doctor account'

    def handle(self, *args, **options):
        # Create test doctor user
        doctor_user = CustomUser.objects.create_user(
            email='doctor@vitacare.com',
            password='Doctor123!',
            first_name='John',
            last_name='Smith',
            role='doctor',
            phone='0723456789',
            address='123 Medical Street, Cape Town'
        )

        # Create doctor profile
        doctor = Doctor.objects.create(
            full_name='John Smith',
            email='doctor@vitacare.com',
            license_number='MED123456',
            password=make_password('Doctor123!')
        )

        self.stdout.write(self.style.SUCCESS(f'Created doctor: {doctor.email} with license: {doctor.license_number}'))
        self.stdout.write(self.style.SUCCESS('Login credentials:'))
        self.stdout.write(self.style.SUCCESS('Email: doctor@vitacare.com'))
        self.stdout.write(self.style.SUCCESS('Password: Doctor123!'))
        self.stdout.write(self.style.SUCCESS('License Number: MED123456'))
