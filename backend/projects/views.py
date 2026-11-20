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

from tasks.serializers import TaskSerializer
from tasks.models import Task

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


        
        
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="tasks",
        permission_classes=[IsAuthenticated]
    )
    def tasks(self, request, *args, **kwargs):

        project = self.get_object()

        # GET: List all tasks belonging to this project
        if request.method == "GET":

            tasks = Task.objects.filter(
                project=project
            ).select_related(
                "created_by",
                "assignee",
                "project"
            ).order_by("-created_at")

            # Filter by status
            status_filter = request.query_params.get("status")

            if status_filter:
                tasks = tasks.filter(status=status_filter)

            # Filter by priority
            priority_filter = request.query_params.get("priority")

            if priority_filter:
                tasks = tasks.filter(priority=priority_filter)

            # Filter by assignee
            assignee_filter = request.query_params.get("assignee")

            if assignee_filter:
                tasks = tasks.filter(assignee_id=assignee_filter)

            serializer = TaskSerializer(
                tasks,
                many=True
            )

            return Response(serializer.data)

        # POST: Create a task inside this project
        serializer = TaskSerializer(
            data=request.data,
            context={
                "request": request,
                "project": project
            }
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


        
    @action(
        detail=True,
        methods=["get", "put", "patch", "delete"],
        url_path=r"tasks/(?P<task_id>[0-9a-fA-F-]+)",
        permission_classes=[IsAuthenticated]
    )
    def task_detail(self, request, *args, **kwargs):

        project = self.get_object()

        task_id = self.kwargs.get("task_id")

        task = Task.objects.filter(
            id=task_id,
            project=project
        ).select_related(
            "created_by",
            "assignee",
            "project"
        ).first()

        if not task:
            return Response(
                {"detail": "Task not found in this project."},
                status=status.HTTP_404_NOT_FOUND
            )

        # GET: Retrieve task details
        if request.method == "GET":

            serializer = TaskSerializer(task)

            return Response(serializer.data)

        # DELETE: Only project owner can delete TODO tasks
        if request.method == "DELETE":

            if project.owner_id != request.user.id:
                return Response(
                    {"detail": "Only the project owner can delete tasks."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if task.status != Task.Status.TODO:
                return Response(
                    {"detail": "Only TODO tasks can be deleted."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            task.delete()

            return Response(
                {"detail": "Task deleted successfully."},
                status=status.HTTP_200_OK
            )

        # PUT/PATCH: Only creator or assignee can update
        if request.method in ["PUT", "PATCH"]:

            is_creator = task.created_by_id == request.user.id

            is_assignee = task.assignee_id == request.user.id

            if not (is_creator or is_assignee):
                return Response(
                    {
                        "detail": (
                            "Only the task creator or assigned user "
                            "can update this task."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = TaskSerializer(
                task,
                data=request.data,
                partial=request.method == "PATCH",
                context={
                    "request": request,
                    "project": project
                }
            )

            serializer.is_valid(raise_exception=True)

            serializer.save()

            return Response(serializer.data)

