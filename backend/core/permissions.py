
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsProjectOwner(BasePermission):

    def has_object_permission(self, request, view, obj):

        # Members can view project details
        if request.method in SAFE_METHODS:
            return True

        # Only the owner can update or delete
        return obj.owner_id == request.user.id
