from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import PrescriptionSerializer, ConsultationSerializer
from .models import Prescription, Consultation
from users.models import Doctor, CustomUser
from appointments.models import Appointment

class PatientPrescriptionsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        patient = request.user
        qs = Prescription.objects.filter(patient=patient).order_by('-date_issued')
        serializer = PrescriptionSerializer(qs, many=True)
        return Response(serializer.data, status=200)

class DoctorCreatePrescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        doctor_email = request.data.get('doctor_email')
        patient_id = request.data.get('patient_id')
        medication = request.data.get('medication')
        if not all([doctor_email, patient_id, medication]):
            return Response({'error':'doctor_email, patient_id and medication required'}, status=400)
        try:
            doctor = Doctor.objects.get(email=doctor_email)
            patient = CustomUser.objects.get(id=patient_id)
        except (Doctor.DoesNotExist, CustomUser.DoesNotExist):
            return Response({'error':'Doctor or patient not found'}, status=404)
        appointment_id = request.data.get('appointment_id')
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(id=appointment_id)
            except Appointment.DoesNotExist:
                appointment = None
        obj = Prescription.objects.create(
            appointment=appointment, doctor=doctor, patient=patient,
            medication=medication, dosage=request.data.get('dosage',''),
            notes=request.data.get('notes','')
        )
        return Response({'message':'created','prescription_id': obj.id}, status=201)

class PatientConsultationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        patient = request.user
        qs = Consultation.objects.filter(patient=patient).order_by('-date')
        serializer = ConsultationSerializer(qs, many=True)
        return Response(serializer.data, status=200)

class DoctorCreateConsultationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        doctor_email = request.data.get('doctor_email')
        patient_id = request.data.get('patient_id')
        summary = request.data.get('summary')
        if not all([doctor_email, patient_id, summary]):
            return Response({'error':'doctor_email, patient_id and summary required'}, status=400)
        try:
            doctor = Doctor.objects.get(email=doctor_email)
            patient = CustomUser.objects.get(id=patient_id)
        except (Doctor.DoesNotExist, CustomUser.DoesNotExist):
            return Response({'error':'Doctor or patient not found'}, status=404)
        appointment = None
        appointment_id = request.data.get('appointment_id')
        if appointment_id:
            try:
                appointment = Appointment.objects.get(id=appointment_id)
            except Appointment.DoesNotExist:
                appointment = None
        obj = Consultation.objects.create(
            appointment=appointment, doctor=doctor, patient=patient,
            summary=summary, follow_up=request.data.get('follow_up','')
        )
        return Response({'message':'created','consultation_id': obj.id}, status=201)
