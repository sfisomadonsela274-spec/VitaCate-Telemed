#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vitacare.settings')
django.setup()

from users.models import Doctor

doctors = Doctor.objects.all()
print(f'Found {doctors.count()} doctors:')
for d in doctors:
    print(f'- {d.email} ({d.license_number})')
