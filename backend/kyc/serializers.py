import os
from rest_framework import serializers
from .models import BusinessProfile, KYCDocument
from .utils.validators import validate_kyc_file


class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields= '__all__'
        read_only_fields = ["id", "merchant", "created_at"]
        # read_only_fields = ["id", "merchant", "created_at", "updated_at"]


class KYCDocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model  = KYCDocument
        fields = [ "id", "merchant", "doc_type", "file", "status", "reviewed_by", "rejection_reason", "uploaded_at"]
        read_only_fields = [ "id", "merchant", "status", "reviewed_by", "rejection_reason", "uploaded_at"]

    def validate_file(self, value):
        return validate_kyc_file(value)

    # validate whether document is pan, aadhar, or bank statement
    def validate_doc_type(self, value):
        allowed = [choice[0] for choice in KYCDocument.DocumentType.choices]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Invalid document type. Allowed: {allowed}"
            )
        return value