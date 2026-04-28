from django.db import models


from django.contrib.auth import get_user_model
User = get_user_model()


# Create your models here.
class BusinessProfile(models.Model):
    class BusinessType(models.TextChoices):
        INDIVIDUAL = "individual", "Individual / Freelancer"
        PARTNERSHIP = "partnership", "Partnership Firm"
        LLP = "llp", "Limited Liability Partnership (LLP)"
        PRIVATE_LIMITED = "private_limited", "Private Limited Company"
        PUBLIC_LIMITED = "public_limited", "Public Limited Company"
        NGO = "ngo", "NGO / Trust / Society"
        OTHER = "other", "Other"

    id = models.BigAutoField(primary_key=True)
    merchant = models.OneToOneField(User, on_delete=models.CASCADE, related_name="business_profile")
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=30, choices=BusinessType.choices, default=BusinessType.OTHER)
    monthly_volume = models.DecimalField(max_digits=12, decimal_places=2, help_text="Expected monthly volume in USD")
    created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.business_name} - [{self.merchant.email}]"
    

class KYCDocument(models.Model):
    class DocumentType(models.TextChoices):
        PAN = "pan", "PAN Card"
        AADHAAR = "aadhaar", "Aadhaar Card"
        BANK_STATEMENT = "bank_statement", "Bank Statement"

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    id = models.BigAutoField(primary_key=True)
    merchant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="kyc_documents")
    doc_type = models.CharField(max_length=20, choices=DocumentType.choices)
    file = models.FileField(upload_to="kyc_documents/")
    status = models.CharField(max_length=10, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_documents")
    rejection_reason = models.TextField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        unique_together = ["merchant", "doc_type"]  # one document per type per merchant

    def __str__(self):
        return f"{self.merchant.email} - {self.doc_type} - [{self.status}]"