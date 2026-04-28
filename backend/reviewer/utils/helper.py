from django.contrib.auth import get_user_model
from ..models import NotificationEvent, KYCSubmission

User = get_user_model()


def log_notification(merchant, event_type, payload=None):
    NotificationEvent.objects.create(
        merchant=merchant,
        event_type=event_type,
        payload=payload or {}
    )


def assign_reviewer_round_robin():
    """
    Assigns the reviewer with the fewest active submissions.
    Active = submitted, under_review, more_info_requested states.
    Falls back to None if no reviewers exist.
    """
    reviewers = User.objects.filter(role="reviewer", is_active=True)

    if not reviewers.exists():
        return None

    active_states = ["submitted", "under_review", "more_info_requested"]

    # pick reviewer with least active assignments
    selected_reviewer = None
    min_count = float("inf")

    for reviewer in reviewers:
        count = KYCSubmission.objects.filter(
            reviewer=reviewer,
            state__in=active_states
        ).count()

        if count < min_count:
            min_count = count
            selected_reviewer = reviewer

    return selected_reviewer