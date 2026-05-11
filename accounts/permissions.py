from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsPharmacieUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'pharmacie'


class IsClientUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'


class IsAdminOrReadOnly(BasePermission):
    """Lecture publique, écriture réservée à l'admin."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(BasePermission):
    """L'objet doit appartenir à l'utilisateur connecté ou être un admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Supporte les objets avec user directement ou via .user
        owner = getattr(obj, 'user', None) or getattr(obj, 'client', None)
        if hasattr(owner, 'user'):
            owner = owner.user
        return owner == request.user
