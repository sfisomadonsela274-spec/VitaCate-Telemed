import json
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vitacare_backend.settings")

import django

django.setup()

from users.models import Doctor

print(json.dumps(list(Doctor.objects.values("id", "email", "license_number"))), flush=True)
