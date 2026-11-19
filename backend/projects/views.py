from django.shortcuts import render

# Create your views here.



from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Project, ProjectMember
from .serializers import ProjectSerializer
from core.permissions import IsProjectOwner
from .services import create_project

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .serializers import ProjectMemberSerializer


class ProjectViewSet(ModelViewSet):

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectOwner
    ]

    lookup_field = "id"

    def get_queryset(self):
        return Project.objects.filter(
            members__user=self.request.user
        ).select_related("owner").distinct()

    def perform_create(self, serializer):

        project = create_project(
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get(
                "description", ""
            ),
            owner=self.request.user
        )

        serializer.instance = project

    
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="members"
    )
    def members(self, request, *args, **kwargs):

        project = self.get_object()

        # POST: Add a project member
        if request.method == "POST":

            serializer = ProjectMemberSerializer(
                data=request.data,
                context={
                    "request": request,
                    "project": project
                }
            )

            serializer.is_valid(raise_exception=True)

            membership = serializer.save()

            return Response(
                ProjectMemberSerializer(
                    membership,
                    context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        # GET: List project members
        members = ProjectMember.objects.filter(
            project=project
        ).select_related("user").order_by("joined_at")

        serializer = ProjectMemberSerializer(
            members,
            many=True
        )

        return Response(serializer.data)


    
    @action(
        detail=True,
        methods=["delete"],
        url_path=r"members/(?P<user_id>[0-9a-fA-F-]+)"
    )
    def remove_member(self, request, *args, **kwargs):

        project = self.get_object()

        user_id = self.kwargs.get("user_id")

        # Prevent the owner from removing themselves
        if str(project.owner_id) == user_id:
            return Response(
                {"detail": "Project owner cannot be removed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the membership
        membership = ProjectMember.objects.filter(
            project=project,
            user_id=user_id
        ).first()

        if not membership:
            return Response(
                {"detail": "User is not a member of this project."},
                status=status.HTTP_404_NOT_FOUND
            )

        membership.delete()

        return Response(
            {"detail": "Project member removed successfully."},
            status=status.HTTP_200_OK
        )


        

