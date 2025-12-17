import random
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes

# Fixed import - removed duplicate Doctor import
from .models import PasswordResetCode, Doctor
from .serializers import (
    UserSignupSerializer,
    ForgotPasswordSerializer,
    ResetCodeVerificationSerializer,
    NewPasswordSerializer
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': getattr(user, 'role', 'patient')  # Safe attribute access
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Use username field for authentication if your custom user model uses email as username
        user = authenticate(request, username=email, password=password)
        
        # Alternative: If above doesn't work, try this approach:
        # try:
        #     user = User.objects.get(email=email)
        #     if user.check_password(password):
        #         # User is authenticated
        #     else:
        #         user = None
        # except User.DoesNotExist:
        #     user = None

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": getattr(user, 'role', 'patient')  # Safe attribute access
                }
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                code = str(random.randint(10000, 99999))
                
                # Delete any existing reset codes for this user
                PasswordResetCode.objects.filter(user=user).delete()
                
                # Create new reset code
                PasswordResetCode.objects.create(user=user, code=code)

                # Send email (commented out for development)
                # send_mail(
                #     'Your VitaCare Reset Code',
                #     f'Your password reset code is: {code}',
                #     'noreply@vitacare.com',
                #     [email],
                #     fail_silently=False,
                # )
                
                # For development, return the code in response
                return Response({
                    'message': 'Code sent to email', 
                    'code': code  # Remove this in production
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({'redirect': 'signup'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyResetCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetCodeVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            try:
                user = User.objects.get(email=email)
                reset_code = PasswordResetCode.objects.filter(user=user, code=code).first()

                if not reset_code:
                    return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

                if reset_code.is_expired():
                    return Response({'error': 'Code expired'}, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    'status': 'verified',
                    'message': 'Code verified successfully'
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NewPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(email=email)
                user.set_password(new_password)  # Use set_password instead of make_password
                user.save()
                
                # Delete used reset codes
                PasswordResetCode.objects.filter(user=user).delete()
                
                return Response({
                    'status': 'password_reset_success',
                    'message': 'Password reset successfully'
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": getattr(user, 'role', 'patient'),  # Safe attribute access
        })


class DoctorLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        license_number = request.data.get("license")
        password = request.data.get("password")

        if not all([email, license_number, password]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doctor = Doctor.objects.get(email=email, license_number=license_number)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found or license mismatch."}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, doctor.password):
            return Response({"error": "Incorrect password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Get or create a proper user for token generation
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': getattr(doctor, 'first_name', ''),
                'last_name': getattr(doctor, 'last_name', ''),
                'password': make_password(str(random.randint(100000, 999999)))  # Random password
            }
        )

        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['doctor_email'] = doctor.email
        refresh['license'] = doctor.license_number
        refresh['role'] = 'doctor'
        refresh['doctor_id'] = doctor.id

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "doctor": {
                "id": doctor.id,
                "name": doctor.full_name,
                "email": doctor.email,
                "license": doctor.license_number,
                "specialization": getattr(doctor, 'specialization', '')
            }
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctor_id(request):
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email parameter is required'}, status=400)
    
    try:
        doctor = Doctor.objects.get(email=email)
        return Response({'doctor_id': doctor.id})
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# Additional useful endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """Endpoint to check if user is authenticated"""
    return Response({
        'authenticated': True,
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'role': getattr(request.user, 'role', 'patient')
        }
    })