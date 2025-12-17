#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vitacare.settings')
django.setup()

from users.models import CustomUser, Doctor
from django.contrib.auth.hashers import make_password

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
    user=doctor_user,
    email='doctor@vitacare.com',
    first_name='John',
    last_name='Smith',
    license_number='MED123456',
    specialization='General Practice',
    phone='0723456789',
    address='123 Medical Street, Cape Town'
)

print(f'Created doctor: {doctor.email} with license: {doctor.license_number}')
print('Login credentials:')
print('Email: doctor@vitacare.com')
print('Password: Doctor123!')
print('License Number: MED123456')
