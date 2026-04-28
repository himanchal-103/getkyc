# GetKYC — Technical Review

---

## 1. The State Machine

### Where does it live?

The state machine lives in `reviewer/utils.py` as a standalone function `transition()`, called explicitly from the `ReviewerQueueViewSet.transition` view.

```python
# reviewer/utils.py

VALID_TRANSITIONS = {
    "submitted":           ["under_review", "more_info_requested"],
    "under_review":        ["approved", "rejected", "more_info_requested"],
    "more_info_requested": ["submitted"],
    "approved":            [],
    "rejected":            [],
}

class InvalidTransition(Exception):
    pass

def transition(submission, new_state):
    allowed = VALID_TRANSITIONS.get(submission.state, [])
    if new_state not in allowed:
        raise InvalidTransition(
            f"Cannot transition from '{submission.state}' to '{new_state}'."
        )
    submission.state = new_state
    submission.save()
```

### How do we prevent an illegal transition?

The `VALID_TRANSITIONS` dict is the single source of truth. Every state maps to an explicit whitelist of states it is allowed to move to. `approved` and `rejected` map to empty lists — they are terminal and cannot be exited.

When `transition()` is called, it looks up the current state's allowed list. If `new_state` is not in it, it raises `InvalidTransition` before touching the database. The view catches this and returns a `400`:

```python
# reviewer/views.py — inside ReviewerQueueViewSet.transition()

try:
    transition(submission, new_state)
except InvalidTransition as e:
    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

There is no way to skip states, reopen a closed case, or jump backwards — the dict simply does not allow it.

---

## 2. The Upload

### How are file uploads validated?

Validation lives in `kyc/utils/validators.py` and is applied at the serializer level so it runs before the file is saved.

```python
# kyc/utils/validators.py

import magic

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_kyc_file(file):
    # 1. Size check — reject before reading content
    if file.size > MAX_FILE_SIZE:
        raise ValidationError(
            f"File too large. Maximum allowed size is 5 MB. "
            f"Your file is {round(file.size / (1024 * 1024), 1)} MB."
        )

    # 2. Magic-byte check — read first 2048 bytes to detect real MIME type
    #    This cannot be spoofed by renaming a file or lying about Content-Type
    header = file.read(2048)
    file.seek(0)  # reset pointer so the file can still be saved
    mime = magic.from_buffer(header, mime=True)

    if mime not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Unsupported file type '{mime}'. "
            f"Allowed types: JPEG, PNG, PDF."
        )
```

The validator is attached to the serializer field:

```python
# kyc/serializers.py

from .utils.validators import validate_kyc_file

class KYCDocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(validators=[validate_kyc_file])
```

### What happens with a 50 MB file?

1. The size check triggers first — before the magic-byte read — so we never waste time inspecting a file we will reject anyway.
2. DRF calls the validator during `.is_valid()`, before `save()`.
3. The response is `400 Bad Request`:

```json
{
  "file": [
    "File too large. Maximum allowed size is 5 MB. Your file is 50.0 MB."
  ]
}
```

The file is never written to disk.
---

## 3. The Queue

### The query that powers the reviewer dashboard

```python
# reviewer/views.py — ReviewerQueueViewSet.queue()

from django.utils.timezone import now
from datetime import timedelta

def queue(self, request):
    queue_states = ["submitted", "under_review"]

    # Core queue: only this reviewer's submissions, oldest first
    submissions = KYCSubmission.objects.filter(
        reviewer=request.user,
        state__in=queue_states
    ).order_by("submitted_at")

    # SLA cutoff: anything older than 24 hours is flagged at-risk
    cutoff_24h = now() - timedelta(hours=24)

    # 7-day metrics scoped to this reviewer only
    seven_days_ago = now() - timedelta(days=7)
    recent = KYCSubmission.objects.filter(
        reviewer=request.user,
        submitted_at__gte=seven_days_ago
    )
    recent_count   = recent.count()
    approved_count = recent.filter(state="approved").count()
    approval_rate  = (
        round((approved_count / recent_count) * 100, 1)
        if recent_count else 0
    )

    # Avg hours in queue — computed in Python over the active queue
    total_seconds = sum(
        (now() - s.submitted_at).total_seconds()
        for s in submissions if s.submitted_at
    )
    avg_hours = round(total_seconds / 3600 / max(submissions.count(), 1), 1)

    # Build response with per-item SLA flag
    queue_data = []
    for s in submissions:
        serializer = KYCSubmissionSerializer(s)
        queue_data.append({
            **serializer.data,
            "at_risk": s.submitted_at < cutoff_24h if s.submitted_at else False,
        })

    return Response({
        "metrics": {
            "queue_count":        submissions.count(),
            "avg_hours_in_queue": avg_hours,
            "approval_rate_7d":   f"{approval_rate}%",
        },
        "queue": queue_data,
    })
```


---

## 4. The Auth

### How does merchant A not see merchant B's submission?

Every query that touches merchant-owned data is filtered by `merchant=request.user` or `reviewer=request.user` at the ORM level — not in the serializer, not in the frontend, but in the `WHERE` clause of every SQL query.

**Merchant submission ownership check:**

```python
# reviewer/views.py — merchant-facing viewset

def retrieve(self, request, pk=None):
    try:
        # merchant=request.user is the guard — if submission.merchant != logged-in user,
        # Django returns DoesNotExist and we return 404, leaking no information
        submission = KYCSubmission.objects.get(pk=pk, merchant=request.user)
        serializer = KYCSubmissionDetailSerializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except KYCSubmission.DoesNotExist:
        return Response(
            {"error": "Submission not found!"},
            status=status.HTTP_404_NOT_FOUND
        )
```

**Document ownership check (same pattern):**

```python
# kyc/views.py — document viewset

def list(self, request):
    docs = KYCDocument.objects.filter(merchant=request.user)
    serializer = KYCDocumentSerializer(docs, many=True)
    return Response(serializer.data)
```

**Why 404 instead of 403?**

Returning `403 Forbidden` confirms that the resource exists but the requester cannot access it. Returning `404 Not Found` reveals nothing — the attacker cannot distinguish "this ID belongs to someone else" from "this ID does not exist at all". This pattern is called **resource existence hiding** and is standard practice for multi-tenant APIs.

**Session authentication as the first gate:**

All protected views use DRF `SessionAuthentication`. If `request.user` is not authenticated, the request never reaches the ownership check — it fails at the authentication layer first:

```python
# settings.py

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

The chain is: **session valid → user authenticated → resource owned by this user**. All three must pass.

---
