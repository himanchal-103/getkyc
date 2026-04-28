VALID_TRANSITIONS = {
    "draft":                ["submitted"],
    "submitted":            ["under_review"],
    "under_review":         ["approved", "rejected", "more_info_requested"],
    "more_info_requested":  ["submitted"],
    "approved":             [],
    "rejected":             [],
}


class InvalidTransition(Exception):
    pass


def transition(submission, new_state):
    allowed = VALID_TRANSITIONS.get(submission.state, [])

    if new_state not in allowed:
        terminal = not allowed
        raise InvalidTransition(
            f"Cannot transition from '{submission.state}' to '{new_state}'. "
            + (f"Allowed transitions: {allowed}" if not terminal
               else f"'{submission.state}' is a terminal state — no further transitions allowed.")
        )

    submission.state = new_state
    submission.save()