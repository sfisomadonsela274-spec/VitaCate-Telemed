
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from appointments.models import Appointment
from prescriptions.models import Prescription
from consultations.models import Consultation
from users.models import CustomUser, Doctor

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_prescription(request):
    try:
        appointment_id = request.data.get("appointment_id")
        doctor_email = request.data.get("doctor_email")
        patient_id = request.data.get("patient_id")
        medication = request.data.get("medication")
        dosage = request.data.get("dosage")
        notes = request.data.get("notes", "")

        if not all([appointment_id, doctor_email, patient_id, medication, dosage]):
            return Response({"error": "Missing required fields."}, status=400)

        appointment = Appointment.objects.filter(id=appointment_id).first()
        doctor = Doctor.objects.filter(email=doctor_email).first()
        patient = CustomUser.objects.filter(id=patient_id).first()

        if not (appointment and doctor and patient):
            return Response({"error": "Invalid appointment/doctor/patient."}, status=400)

        pres = Prescription.objects.create(
            appointment=appointment,
            doctor=doctor,
            patient=patient,
            medication=medication,
            dosage=dosage,
            notes=notes
        )
        return Response({"message": "Prescription created successfully", "id": pres.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_consultation(request):
    try:
        appointment_id = request.data.get("appointment_id")
        doctor_email = request.data.get("doctor_email")
        patient_id = request.data.get("patient_id")
        summary = request.data.get("summary")
        notes = request.data.get("notes", "")
        follow_up = request.data.get("follow_up", "")

        if not all([appointment_id, doctor_email, patient_id, summary]):
            return Response({"error": "Missing required fields."}, status=400)

        appointment = Appointment.objects.filter(id=appointment_id).first()
        doctor = Doctor.objects.filter(email=doctor_email).first()
        patient = CustomUser.objects.filter(id=patient_id).first()

        if not (appointment and doctor and patient):
            return Response({"error": "Invalid appointment/doctor/patient."}, status=400)

        consult = Consultation.objects.create(
            appointment=appointment,
            doctor=doctor,
            patient=patient,
            summary=summary,
            notes=notes,
            follow_up=follow_up
        )
        return Response({"message": "Consultation created successfully", "id": consult.id}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_prescriptions(request):
    user = request.user
    if not user.is_patient:
        return Response({"error": "Only patients can access this endpoint."}, status=403)

    prescriptions = Prescription.objects.filter(patient=user).order_by("-date_issued")
    data = []
    for p in prescriptions:
        data.append({
            "id": p.id,
            "doctor_name": getattr(p.doctor, "full_name", p.doctor.email),
            "medication": p.medication,
            "dosage": p.dosage,
            "notes": p.notes,
            "date_issued": getattr(p, "date_issued", ""),
        })
    return Response(data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_consultations(request):
    user = request.user
    if not user.is_patient:
        return Response({"error": "Only patients can access this endpoint."}, status=403)

    consultations = Consultation.objects.filter(patient=user).order_by("-date")
    data = []
    for c in consultations:
        data.append({
            "id": c.id,
            "doctor_name": getattr(c.doctor, "full_name", c.doctor.email),
            "summary": c.summary,
            "notes": c.notes,
            "follow_up": getattr(c, "follow_up", ""),
            "date": getattr(c, "date", "")
        })
    return Response(data, status=200)