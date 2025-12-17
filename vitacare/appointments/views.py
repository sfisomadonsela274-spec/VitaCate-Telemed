from datetime import datetime, timedelta, time
from django.utils import timezone
import logging
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import AppointmentSerializer
from .models import Appointment
from users.models import Doctor, CustomUser

logger = logging.getLogger(__name__)

class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            patient = request.user
            doctor_id = request.data.get("doctor")
            custom_date = request.data.get("date")  # Optional: YYYY-MM-DD
            custom_time = request.data.get("time")  # Optional: HH:MM:SS
            reason = request.data.get("reason", "")

            try:
                doctor = Doctor.objects.get(id=doctor_id)
            except Doctor.DoesNotExist:
                return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

            if custom_date:
                try:
                    date_obj = datetime.strptime(custom_date, "%Y-%m-%d").date()
                except ValueError:
                    return Response({"error": "Invalid date format (use YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                date_obj = timezone.now().date()

            latest_appointment = Appointment.objects.filter(doctor=doctor, date=date_obj).order_by('-time').first()
            suggested_time = time(6, 0)
            if latest_appointment:
                suggested_time = (datetime.combine(date_obj, latest_appointment.time) + timedelta(minutes=90)).time()

            if suggested_time >= time(20, 0):
                date_obj += timedelta(days=1)
                suggested_time = time(6, 0)

            if custom_time:
                try:
                    patient_time = datetime.strptime(custom_time, "%H:%M:%S").time()
                    if patient_time < time(6, 0) or patient_time > time(20, 0):
                        return Response({"error": "Appointments must be between 06:00 and 20:00"}, status=status.HTTP_400_BAD_REQUEST)
                    if latest_appointment and patient_time < suggested_time:
                        return Response({"error": "Time must be at least 1hr30m after last appointment"}, status=status.HTTP_400_BAD_REQUEST)
                    final_time = patient_time
                except ValueError:
                    return Response({"error": "Invalid time format (use HH:MM:SS)"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                final_time = suggested_time

            if Appointment.objects.filter(doctor=doctor, date=date_obj, time=final_time).exists():
                return Response({"error": "This time slot is already booked for the doctor."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = AppointmentSerializer(data={
                "doctor": doctor.id,
                "patient": patient.id,
                "doctor_name": doctor.full_name,
                "date": date_obj,
                "time": final_time,
                "reason": reason
            })

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Appointment booked successfully",
                    "suggested_time": final_time.strftime("%H:%M:%S"),
                    "appointment": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.exception("Error in BookAppointmentView.post")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyLatestAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            latest = Appointment.objects.filter(patient=request.user).order_by('-date', '-time').first()
            if latest:
                return Response({
                    "appointment_id": latest.id,
                    "doctor_name": latest.doctor_name,
                    "date": latest.date.isoformat(),
                    "time": latest.time.strftime("%H:%M:%S"),
                    "reason": latest.reason or ""
                }, status=status.HTTP_200_OK)
            return Response({"message": "No appointments found"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as exc:
            logger.exception("Error in MyLatestAppointmentView.get")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DoctorAppointmentsListView(APIView):
    permission_classes = [AllowAny]  # could be IsAuthenticated if using tokens

    def get(self, request):
        try:
            doctor_email = request.GET.get("email")
            if not doctor_email:
                return Response({"error": "Doctor email required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                doctor = Doctor.objects.get(email=doctor_email)
            except Doctor.DoesNotExist:
                return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

            appointments = Appointment.objects.filter(doctor=doctor).order_by('date', 'time')
            if not appointments.exists():
                return Response({"message": "No appointments found"}, status=status.HTTP_204_NO_CONTENT)

            data = []
            for a in appointments:
                data.append({
                    "appointment_id": a.id,
                    "patient_id": a.patient.id,
                    "patient_email": a.patient.email,
                    "date": a.date.isoformat(),
                    "time": a.time.strftime("%H:%M:%S"),
                    "reason": a.reason or "N/A"
                })
            return Response({"appointments": data}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Error in DoctorAppointmentsListView.get")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            try:
                appt = Appointment.objects.get(id=appointment_id)
            except Appointment.DoesNotExist:
                return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

            appt.delete()  # remove from list (or mark completed if you have a flag)
            return Response({'message': 'Appointment completed and removed'}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Error in CompleteAppointmentView.post")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppointmentDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        appt_id = request.GET.get('id')
        if not appt_id:
            return Response({'error': 'id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            appt = Appointment.objects.get(id=appt_id)
            return Response({
                'id': appt.id,
                'patient_id': appt.patient.id,
                'patient_email': appt.patient.email,
                'doctor_id': appt.doctor.id,
                'doctor_name': appt.doctor_name,
                'date': appt.date.isoformat(),
                'time': appt.time.strftime('%H:%M:%S'),
                'reason': appt.reason or ''
            }, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)