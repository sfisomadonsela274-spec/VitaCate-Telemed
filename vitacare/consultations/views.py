from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import ConsultationSerializer
from .models import Consultation
from users.models import Doctor
from django.shortcuts import get_object_or_404
from users.models import CustomUser

class PatientConsultationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = request.user
        consultations = Consultation.objects.filter(patient=patient).order_by('-date')
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=200)

class DoctorCreateConsultationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_email = request.data.get('doctor_email')
        patient_id = request.data.get('patient_id')
        if not doctor_email or not patient_id or not request.data.get('summary'):
            return Response({"error":"doctor_email, patient_id and summary are required"}, status=400)

        try:
            doctor = Doctor.objects.get(email=doctor_email)
        except Doctor.DoesNotExist:
            return Response({"error":"Doctor not found"}, status=404)

        try:
            patient = CustomUser.objects.get(id=patient_id)
        except CustomUser.DoesNotExist:
            return Response({"error":"Patient not found"}, status=404)

        data = {
            "appointment": request.data.get('appointment_id', None),
            "doctor": doctor.id,
            "patient": patient.id,
            "summary": request.data.get('summary'),
            "follow_up": request.data.get('follow_up','')
        }
        serializer = ConsultationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Consultation saved", "consultation": serializer.data}, status=201)
        return Response(serializer.errors, status=400)
