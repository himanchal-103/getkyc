from django.db import models

from django.contrib.auth import get_user_model
User = get_user_model()


# Create your models here.
class KYCSubmission(models.Model):
    class State(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        MORE_INFO_REQUESTED = "more_info_requested", "More Info Requested"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.BigAutoField(primary_key=True)
    merchant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="kyc_submissions")
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_submissions")
    state = models.CharField(max_length=25, choices=State.choices, default=State.DRAFT)
    remark = models.TextField(null=True, blank=True, help_text="Rejection reason or more info request details")
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["submitted_at"]

    def __str__(self):
        return f"{self.merchant.email} - [{self.state}]"


class NotificationEvent(models.Model):
    id = models.BigAutoField(primary_key=True)
    merchant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    event_type = models.CharField(max_length=50)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.merchant.email} - {self.event_type} - {self.created_at}"