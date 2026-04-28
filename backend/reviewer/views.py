from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta

from .models import KYCSubmission, NotificationEvent
from .serializers import (
    KYCSubmissionSerializer,
    KYCSubmissionDetailSerializer,
    NotificationEventSerializer,
)
from .utils.state_machine import transition, InvalidTransition
from .utils.helper import log_notification, assign_reviewer_round_robin
from kyc.models import KYCDocument


class KYCSubmissionViewSet(viewsets.ViewSet):
    """
    Merchant-facing viewset.
    Handles draft creation and submit action.
    """
    queryset = KYCSubmission.objects.all()
    serializer_class = KYCSubmissionSerializer

    # def list(self, request):
    #     submissions = self.queryset.filter(merchant=request.user)
    #     serializer = self.serializer_class(submissions, many=True)
    #     return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            submission = self.queryset.get(merchant=request.user)
            serializer = self.serializer_class(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KYCSubmission.DoesNotExist:
            return Response(
                {"error": "Submission not found for merchant!"},
                status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request):
        """
        Create a draft submission.
        """

        active_states = ["draft", "submitted", "under_review", "more_info_requested"]
        if self.queryset.filter(merchant=request.user, state__in=active_states).exists():
            return Response(
                {"error": "You already have an active submission in progress."},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission = KYCSubmission.objects.create(
            merchant=request.user,
            state=KYCSubmission.State.DRAFT
        )
        serializer = self.serializer_class(submission)
        return Response(
            {
                "message": "Draft submission created.",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    def submit(self, request, pk=None):
        """
        Merchant submits their KYC.
        Validates all 3 documents are uploaded before allowing submission.
        Assigns a reviewer via round-robin on submission.
        """
        try:
            submission = self.queryset.get(pk=pk, merchant=request.user)
        except KYCSubmission.DoesNotExist:
            return Response(
                {"error": "Submission not found!"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if submission and submission.state == 'submitted':
            return Response(
                {"message": "Submission is already done."},
                status=status.HTTP_200_OK
            )

        # enforce all 3 documents must be uploaded before submit
        required_types = [choice[0] for choice in KYCDocument.DocumentType.choices]
        uploaded_types = list(
            KYCDocument.objects.filter(merchant=request.user)
            .values_list("doc_type", flat=True)
        )
        missing = [t for t in required_types if t not in uploaded_types]
        if missing:
            return Response(
                {
                    "error": "All documents must be uploaded before submitting.",
                    "missing_documents": missing,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # run state transition
        try:
            transition(submission, "submitted")
        except InvalidTransition as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # assign reviewer via round-robin
        assigned_reviewer = assign_reviewer_round_robin()
        submission.submitted_at = now()
        submission.reviewer = assigned_reviewer
        submission.save()

        log_notification(
            merchant=request.user,
            event_type="submission_submitted",
            payload={
                "submission_id":      submission.id,
                "state":              submission.state,
                "assigned_reviewer":  assigned_reviewer.email if assigned_reviewer else None,
            }
        )

        serializer = self.serializer_class(submission)
        return Response(
            {
                "message": "Submission sent for review.",
                "assigned_reviewer": assigned_reviewer.email if assigned_reviewer else None,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class ReviewerQueueViewSet(viewsets.ViewSet):
    """
    Reviewer-facing viewset.
    Queue listing, full detail view, and state transitions.
    """
    queryset = KYCSubmission.objects.all()

    def queue(self, request):
        """
        Reviewer sees only their assigned submissions, oldest first.
        Includes SLA flag and dashboard metrics.
        """
        queue_states = ["submitted", "under_review"]
        submissions = self.queryset.filter(
            reviewer=request.user,
            state__in=queue_states
        ).order_by("submitted_at")

        cutoff_24h = now() - timedelta(hours=24)
        seven_days_ago = now() - timedelta(days=7)

        # metrics scoped to this reviewer
        recent = self.queryset.filter(
            reviewer=request.user,
            submitted_at__gte=seven_days_ago
        )
        recent_count = recent.count()
        approved_count = recent.filter(state="approved").count()
        approval_rate = round((approved_count / recent_count) * 100, 1) if recent_count else 0

        total_seconds = sum(
            (now() - s.submitted_at).total_seconds()
            for s in submissions if s.submitted_at
        )
        avg_hours = round(total_seconds / 3600 / max(submissions.count(), 1), 1)

        queue_data = []
        for s in submissions:
            serializer = KYCSubmissionSerializer(s)
            queue_data.append({
                **serializer.data,
                "at_risk": s.submitted_at < cutoff_24h if s.submitted_at else False,
            })

        return Response({
            "metrics": {
                "queue_count": submissions.count(),
                "avg_hours_in_queue": avg_hours,
                "approval_rate_7d": f"{approval_rate}%",
            },
            "queue": queue_data,
        })

    def retrieve(self, request, pk=None):
        """Full submission detail — business profiles + documents."""
        try:
            submission = self.queryset.get(pk=pk, reviewer=request.user)
            serializer = KYCSubmissionDetailSerializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KYCSubmission.DoesNotExist:
            return Response(
                {"error": "Submission not found!"},
                status=status.HTTP_404_NOT_FOUND
            )

    def transition(self, request, pk=None):
        """
        Single endpoint for all reviewer transitions.
        Body: { "new_state": "approved" | "rejected" | "more_info_requested" | "under_review", "reason": "..." }
        reason is required for rejected and more_info_requested.
        """
        try:
            submission = self.queryset.get(pk=pk, reviewer=request.user)
        except KYCSubmission.DoesNotExist:
            return Response(
                {"error": "Submission not found!"},
                status=status.HTTP_404_NOT_FOUND
            )

        new_state = request.data.get("new_state")
        remark = request.data.get("reason", "")

        if not new_state:
            return Response(
                {"error": "new_state is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_state in ["rejected", "more_info_requested"] and not remark:
            return Response(
                {"error": f"reason is required when transitioning to '{new_state}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            transition(submission, new_state)
        except InvalidTransition as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        submission.reason = remark or None
        submission.save()

        # Cascade state to all related KYC documents
        if new_state in ["approved", "rejected"]:
            doc_status = (
                KYCDocument.VerificationStatus.VERIFIED
                if new_state == "approved"
                else KYCDocument.VerificationStatus.REJECTED
            )
            KYCDocument.objects.filter(merchant=submission.merchant).update(
                status=doc_status,
                reviewed_by=request.user,
                rejection_reason=remark or None
            )

        log_notification(
            merchant=submission.merchant,
            event_type=f"submission_{new_state}",
            payload={
                "submission_id": submission.id,
                "new_state":     new_state,
                "reviewer":      request.user.email,
                "reason":        remark,
            }
        )

        serializer = KYCSubmissionSerializer(submission)
        return Response(
            {
                "message": f"Submission moved to '{new_state}'.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class NotificationEventViewSet(viewsets.ViewSet):
    """Merchant-facing notification log."""
    queryset         = NotificationEvent.objects.all()
    serializer_class = NotificationEventSerializer

    def list(self, request):
        notifications = self.queryset.filter(merchant=request.user)
        serializer    = self.serializer_class(notifications, many=True)
        return Response(serializer.data)