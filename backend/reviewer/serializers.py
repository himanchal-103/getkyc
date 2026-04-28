from rest_framework import serializers
from django.utils.timezone import now
from datetime import timedelta
from .models import KYCSubmission, NotificationEvent
from kyc.models import BusinessProfile, KYCDocument
from kyc.serializers import BusinessProfileSerializer, KYCDocumentSerializer


class KYCSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCSubmission
        fields = '__all__'
        read_only_fields = ["id", "merchant", "reviewer", "state", "submitted_at", "created_at", "updated_at"]


class KYCSubmissionDetailSerializer(serializers.ModelSerializer):
    """
    Full detail serializer for reviewer dashboard.
    Includes merchant's business profiles, documents, and SLA flag.
    """
    business_profiles = serializers.SerializerMethodField()
    documents         = serializers.SerializerMethodField()
    at_risk           = serializers.SerializerMethodField()

    class Meta:
        model = KYCSubmission
        fields = ["id", "merchant", "reviewer", "state", "remark", "at_risk", "business_profiles", "documents", "submitted_at", "created_at", "updated_at"]

    def get_business_profiles(self, obj):
        profiles = BusinessProfile.objects.filter(merchant=obj.merchant)
        return BusinessProfileSerializer(profiles, many=True).data

    def get_documents(self, obj):
        docs = KYCDocument.objects.filter(merchant=obj.merchant)
        return KYCDocumentSerializer(docs, many=True).data

    def get_at_risk(self, obj):
        if not obj.submitted_at:
            return False
        return obj.submitted_at < now() - timedelta(hours=24)


class NotificationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model  = NotificationEvent
        fields = ["id", "merchant", "event_type", "payload", "created_at"]
        read_only_fields = fields