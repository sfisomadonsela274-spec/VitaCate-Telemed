from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re

from .models import PasswordResetCode

User = get_user_model()

class UserSignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password', 'phone', 'address', 'role']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True}
        }

    def validate_email(self, value):
        """
        Validate email format and uniqueness
        """
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value.lower()  # Normalize email to lowercase

    def validate_password(self, value):
        """
        Validate password strength
        """
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        # Additional custom validation
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        return value

    def validate_phone(self, value):
        """
        Validate phone number format (basic validation)
        """
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value

    def validate_role(self, value):
        """
        Validate role field
        """
        allowed_roles = ['patient', 'doctor']
        if value not in allowed_roles:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(allowed_roles)}")
        return value

    def validate(self, data):
        """
        Cross-field validation
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Ensure required fields are present
        required_fields = ['email', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        
        return data

    def create(self, validated_data):
        """
        Create user with hashed password
        """
        validated_data.pop('confirm_password')
        
        # Hash password
        validated_data['password'] = make_password(validated_data['password'])
        
        # Create user
        user = User.objects.create(**validated_data)
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Validate email format
        """
        try:
            validate_email(value)
            return value.lower()  # Normalize email
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")


class ResetCodeVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=5, min_length=5, required=True)

    def validate_email(self, value):
        try:
            validate_email(value)
            return value.lower()
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

    def validate_code(self, value):
        """
        Validate reset code format (5 digits)
        """
        if not value.isdigit() or len(value) != 5:
            raise serializers.ValidationError("Reset code must be exactly 5 digits.")
        return value

    def validate(self, data):
        """
        Verify that the user exists and code is valid
        """
        email = data['email']
        code = data['code']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        
        # Check if reset code exists and is valid
        reset_code = PasswordResetCode.objects.filter(user=user, code=code).first()
        if not reset_code:
            raise serializers.ValidationError({"code": "Invalid reset code."})
        
        if reset_code.is_expired():
            raise serializers.ValidationError({"code": "Reset code has expired."})
        
        # Store the reset code instance for use in view
        data['reset_code_instance'] = reset_code
        return data


class NewPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    new_password = serializers.CharField(min_length=8, required=True, write_only=True)
    confirm_password = serializers.CharField(min_length=8, required=True, write_only=True)

    def validate_email(self, value):
        try:
            validate_email(value)
            return value.lower()
        except ValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

    def validate_new_password(self, value):
        """
        Validate new password strength
        """
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        # Additional custom validation
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        return value

    def validate(self, data):
        """
        Cross-field validation for passwords
        """
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # Verify user exists
        try:
            user = User.objects.get(email=data['email'])
            data['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        
        return data


# Additional serializer for user profile updates
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'address', 'role']
        read_only_fields = ['id', 'email', 'role']  # These fields cannot be updated

    def validate_phone(self, value):
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value


# Serializer for doctor-specific registration (if needed)
class DoctorSignupSerializer(UserSignupSerializer):
    license_number = serializers.CharField(max_length=50, required=True)
    specialization = serializers.CharField(max_length=100, required=True)
    experience_years = serializers.IntegerField(min_value=0, required=True)

    class Meta(UserSignupSerializer.Meta):
        fields = UserSignupSerializer.Meta.fields + ['license_number', 'specialization', 'experience_years']

    def validate_license_number(self, value):
        """
        Validate license number format
        """
        if not value.strip():
            raise serializers.ValidationError("License number is required.")
        return value.strip()

    def validate_specialization(self, value):
        """
        Validate specialization
        """
        if not value.strip():
            raise serializers.ValidationError("Specialization is required.")
        return value.strip()