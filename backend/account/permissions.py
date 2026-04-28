from rest_framework.permissions import BasePermission


class IsMerchant(BasePermission):
    message = "Access restricted to merchants only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == request.user.Role.MERCHANT
        )


class IsReviewer(BasePermission):
    message = "Access restricted to reviewers only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == request.user.Role.REVIEWER
        )


class IsAdmin(BasePermission):
    message = "Access restricted to admins only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == request.user.Role.ADMIN
        )


class IsAdminOrReviewer(BasePermission):
    message = "Access restricted to admins and reviewers only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in [
                request.user.Role.ADMIN,
                request.user.Role.REVIEWER,
            ]
        )


class IsAdminOrMerchant(BasePermission):
    message = "Access restricted to admins and merchants only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in [
                request.user.Role.ADMIN,
                request.user.Role.MERCHANT,
            ]
        )