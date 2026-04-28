from django.urls import path
from .views import KYCSubmissionViewSet, ReviewerQueueViewSet, NotificationEventViewSet

# merchant submission
# submission_list   = KYCSubmissionViewSet.as_view({
#     "get": "list"
# })

submission_create = KYCSubmissionViewSet.as_view({
    "post": "create"
})

submission_detail = KYCSubmissionViewSet.as_view({
    "get": "retrieve"
})

submission_submit = KYCSubmissionViewSet.as_view({
    "post": "submit"
})


# reviewer
reviewer_queue = ReviewerQueueViewSet.as_view({
    "get": "queue"
})

reviewer_detail = ReviewerQueueViewSet.as_view({
    "get": "retrieve"
})

reviewer_transition = ReviewerQueueViewSet.as_view({
    "post": "transition"
})


# notifications
notification_list = NotificationEventViewSet.as_view({
    "get": "list"
})


urlpatterns = [
    # merchant
    # path("submissions/", submission_list, name="submission-list"),
    path("submissions/create/", submission_create, name="submission-create"),
    path("submissions/", submission_detail, name="submission-detail"),
    path("submissions/<int:pk>/submit/", submission_submit, name="submission-submit"),

    # reviewer
    path("reviewer/queue/", reviewer_queue, name="reviewer-queue"),
    path("reviewer/submissions/<int:pk>/", reviewer_detail, name="reviewer-detail"),
    path("reviewer/submissions/<int:pk>/transition/", reviewer_transition, name="reviewer-transition"),

    # notifications
    path("notifications/", notification_list, name="notification-list"),
]