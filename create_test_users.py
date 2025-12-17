import os
import sys
import django

# Add the vitacare directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'vitacare'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vitacare.settings')
django.setup()

from users.models import CustomUser

def create_test_users():
    try:
        # Create test patient
        patient, created = CustomUser.objects.get_or_create(
            email='patient@test.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'patient',
                'phone': '1234567890',
                'address': '123 Patient St'
            }
        )
        if created:
            patient.set_password('testpass123')
            patient.save()
            print('✓ Test patient created: patient@test.com / testpass123')
        else:
            print('✓ Test patient already exists')
            
    except Exception as e:
        print(f'✗ Error creating patient: {e}')

    try:
        # Create test doctor
        doctor, created = CustomUser.objects.get_or_create(
            email='doctor@test.com',
            defaults={
                'first_name': 'Dr. Sarah',
                'last_name': 'Smith',
                'role': 'doctor',
                'phone': '0987654321',
                'address': '456 Doctor Ave'
            }
        )
        if created:
            doctor.set_password('testpass123')
            doctor.save()
            print('✓ Test doctor created: doctor@test.com / testpass123')
        else:
            print('✓ Test doctor already exists')
            
    except Exception as e:
        print(f'✗ Error creating doctor: {e}')

if __name__ == '__main__':
    create_test_users()
    print('\nTest users are ready for login!')
