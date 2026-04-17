import os
import sys
import django
from datetime import timedelta, time

sys.path.append(os.path.join(os.path.dirname(__file__), 'vitacare'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vitacare.settings')
django.setup()

from users.models import CustomUser, Doctor
from appointments.models import Appointment
from prescriptions.models import Prescription
from consultations.models import Consultation
from chat.models import ChatMessage
from django.utils import timezone


def clear_data():
    print("Clearing past demo data...")
    ChatMessage.objects.all().delete()
    Prescription.objects.all().delete()
    Consultation.objects.all().delete()
    Appointment.objects.all().delete()
    CustomUser.objects.all().delete()
    Doctor.objects.all().delete()
    print("Done.\n")


def run():
    clear_data()
    print("Seeding new demo data...")
    today = timezone.now().date()

    # ── Doctors (Doctor model + matching CustomUser for JWT login) ──────────
    doc1 = Doctor.objects.create(
        email='dr.smith@vitacare.com',
        full_name='Dr. Sarah Smith',
        license_number='MED-1001',
        password='testpass123',
    )
    doc2 = Doctor.objects.create(
        email='dr.chen@vitacare.com',
        full_name='Dr. Michael Chen',
        license_number='MED-1002',
        password='testpass123',
    )
    doc3 = Doctor.objects.create(
        email='dr.senior@vitacare.com',
        full_name='Senior Doctor',
        license_number='MED-9999',
        password='testpass123',
    )

    u_doc1 = CustomUser.objects.create(
        email=doc1.email, first_name='Sarah', last_name='Smith', role='doctor'
    )
    u_doc1.set_password('testpass123')
    u_doc1.save()

    u_doc2 = CustomUser.objects.create(
        email=doc2.email, first_name='Michael', last_name='Chen', role='doctor'
    )
    u_doc2.set_password('testpass123')
    u_doc2.save()

    u_doc3 = CustomUser.objects.create(
        email=doc3.email, first_name='Senior', last_name='Doctor', role='doctor'
    )
    u_doc3.set_password('testpass123')
    u_doc3.save()

    # ── Patients ────────────────────────────────────────────────────────────
    def make_patient(email, first, last, phone):
        p = CustomUser.objects.create(
            email=email, first_name=first, last_name=last,
            role='patient', phone=phone
        )
        p.set_password('testpass123')
        p.save()
        return p

    john  = make_patient('patient@test.com', 'John',  'Doe',     '1234567890')
    alice = make_patient('alice@demo.com',   'Alice', 'Johnson', '5551234567')
    bob   = make_patient('bob@demo.com',     'Bob',   'Smith',   '5559876543')
    test_p = make_patient('patient.test@demo.com', 'Test', 'Patient', '5550009999')

    print("Users created.")

    # ── Appointments ────────────────────────────────────────────────────────
    def appt(patient, doctor, days_offset, t, reason):
        return Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            doctor_name=doctor.full_name,
            date=today + timedelta(days=days_offset),
            time=t,
            reason=reason,
        )

    a1 = appt(john,  doc1,  1, time(10,  0), "Heart palpitation follow-up")
    a2 = appt(john,  doc2,  3, time(14, 30), "Annual checkup")
    a3 = appt(alice, doc1,  0, time( 9,  0), "Blood pressure review")
    a4 = appt(bob,   doc2,  0, time(11,  0), "Fever and chills")
    a5 = appt(john,  doc1, -5, time( 9,  0), "Initial consultation")
    a6 = appt(alice, doc2, -3, time(10, 30), "Respiratory infection")

    # ── Prescriptions (for past/today appointments) ─────────────────────────
    def rx(patient, doctor, appointment, medication, dosage, notes):
        Prescription.objects.create(
            patient=patient,
            doctor=doctor,
            appointment=appointment,
            medication=medication,
            dosage=dosage,
            notes=notes,
        )

    rx(alice, doc1, a3, "Lisinopril 10mg",  "1 tablet once daily",  "Take in the morning with water.")
    rx(bob,   doc2, a4, "Amoxicillin 500mg","1 capsule twice daily", "Complete the full 7-day course.")
    rx(john,  doc1, a5, "Aspirin 75mg",     "1 tablet once daily",   "Take with food to avoid stomach upset.")
    rx(alice, doc2, a6, "Azithromycin 250mg","1 tablet daily",        "Take at the same time each day.")

    print("Appointments & Prescriptions created.")

    # ── Consultations ───────────────────────────────────────────────────────
    def consult(patient, doctor, appointment, summary, follow_up=""):
        Consultation.objects.create(
            patient=patient, doctor=doctor, appointment=appointment,
            summary=summary, follow_up=follow_up,
        )

    consult(alice, doc1, a3,
            "Patient presents with elevated BP (145/90). Prescribed Lisinopril. Advised low-sodium diet.",
            "Review in 2 weeks")
    consult(bob,   doc2, a4,
            "Fever 38.5°C, productive cough. Chest clear. Likely viral URI with secondary bacterial component.",
            "Return if not improving in 5 days")
    consult(john,  doc1, a5,
            "Initial visit. Family history of heart disease noted. ECG normal. Mild tachycardia.",
            "Holter monitor next visit")
    consult(alice, doc2, a6,
            "Respiratory infection confirmed. Oxygen saturation 97%. Prescribed azithromycin.",
            "Follow up if fever persists")

    print("Consultations created.")

    # ── Chat history (John <-> Dr. Smith) ───────────────────────────────────
    print("Generating chat histories...")
    convo = [
        (john,   u_doc1, "Hello Dr. Smith, my blood pressure hasn't gone down since our last visit.", -4),
        (u_doc1, john,   "Are you taking the Aspirin every morning as prescribed? Have you reduced salt intake?", -4),
        (john,   u_doc1, "Yes, every morning. I've been trying to eat less salt too.", -3),
        (u_doc1, john,   "Good. Let's also try some light exercise — 20 minutes walking daily. Monitor your BP and log it.", -3),
        (john,   u_doc1, "Alright, I'll start tomorrow. Should I be worried about the palpitations?", -2),
        (u_doc1, john,   "At this stage no — they're likely stress-related. But that's exactly what we'll check at our next appointment.", -2),
        (john,   u_doc1, "Okay, that's reassuring. Thank you Doctor.", -1),
        (u_doc1, john,   "Of course. See you soon. Call the clinic immediately if you feel chest pain or shortness of breath.", -1),
    ]

    for sender, receiver, msg, days_offset in convo:
        obj = ChatMessage.objects.create(
            sender=sender, receiver=receiver,
            message=msg, is_read=True,
        )
        # backdate the timestamps
        obj.timestamp = timezone.now() + timedelta(days=days_offset, hours=days_offset * -2)
        obj.save()

    print("Chat history created.")
    print("\n========================================")
    print("  DEMO SEEDING COMPLETE")
    print("========================================")
    print("  Patient  → patient@test.com / testpass123")
    print("  Test Pat → patient.test@demo.com / testpass123")
    print("  Doctor   → dr.smith@vitacare.com / testpass123  (License: MED-1001)")
    print("  Doctor   → dr.chen@vitacare.com  / testpass123  (License: MED-1002)")
    print("  Senior Dr→ dr.senior@vitacare.com / testpass123 (License: MED-9999)")
    print("========================================\n")


if __name__ == '__main__':
    run()
