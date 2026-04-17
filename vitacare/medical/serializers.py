from rest_framework import serializers
from .models import Prescription, Consultation, Vitals

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ('date_issued',)

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('date',)

class VitalsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vitals
        fields = '__all__'
        read_only_fields = ('timestamp',)