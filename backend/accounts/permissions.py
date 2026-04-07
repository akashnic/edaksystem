from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsReceiverUser(permissions.BasePermission):
    """
    Allows access only to receiver users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'RECEIVER' or request.user.role == 'ADMIN'))

class IsDispatcherUser(permissions.BasePermission):
    """
    Allows access only to dispatcher users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'DISPATCHER' or request.user.role == 'ADMIN'))
