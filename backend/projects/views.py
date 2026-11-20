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
from .serializers import AvailableUserSerializer
from tasks.serializers import TaskSerializer
from tasks.models import Task

from django.db.models import Count, Q
from tasks.serializers import (TaskSerializer, TaskListQuerySerializer)
from core.pagination import TaskPagination
from django.contrib.auth import get_user_model
User = get_user_model()

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

            # 1. Validate query parameters
            query_serializer = TaskListQuerySerializer(
                data=request.query_params
            )

            query_serializer.is_valid(raise_exception=True)

            filters = query_serializer.validated_data

            # 2. Get tasks belonging to this project
            tasks = Task.objects.filter(
                project=project
            ).select_related(
                "created_by",
                "assignee",
                "project"
            ).order_by("-created_at")

            # 3. Apply status filter
            status_filter = filters.get("status")

            if status_filter:
                tasks = tasks.filter(status=status_filter)

            # 4. Apply priority filter
            priority_filter = filters.get("priority")

            if priority_filter:
                tasks = tasks.filter(priority=priority_filter)

            # 5. Apply assignee filter
            assignee_filter = filters.get("assignee")

            if assignee_filter:
                tasks = tasks.filter(
                    assignee_id=assignee_filter
                )

            # 6. Search title and description
            search_query = filters.get("search", "").strip()

            if search_query:
                tasks = tasks.filter(
                    Q(title__icontains=search_query) |
                    Q(description__icontains=search_query)
                )

            # 7. Paginate results
            paginator = TaskPagination()

            paginated_tasks = paginator.paginate_queryset(
                tasks,
                request,
                view=self
            )

            serializer = TaskSerializer(
                paginated_tasks,
                many=True
            )

            return paginator.get_paginated_response(
                serializer.data
            )


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



    @action(
        detail=True,
        methods=["get"],
        url_path="dashboard",
        permission_classes=[IsAuthenticated]
    )
    def dashboard(self, request, *args, **kwargs):
        project = self.get_object()

        statistics = Task.objects.filter(
            project=project
        ).aggregate(
            total_tasks=Count("id"),
            todo_tasks=Count(
                "id",
                filter=Q(status=Task.Status.TODO)
            ),
            in_progress_tasks=Count(
                "id",
                filter=Q(status=Task.Status.IN_PROGRESS)
            ),
            completed_tasks=Count(
                "id",
                filter=Q(status=Task.Status.COMPLETED)
            ),
            assigned_to_me=Count(
                "id",
                filter=Q(assignee=request.user)
            )
        )

        return Response(statistics, status=status.HTTP_200_OK)




    @action(
        detail=False,
        methods=["get"],
        url_path="dashboard",
        permission_classes=[IsAuthenticated]
    )
    def dashboard(self, request):
        projects = self.get_queryset().annotate(
            total_tasks=Count("tasks"),
            todo_tasks=Count(
                "tasks",
                filter=Q(tasks__status=Task.Status.TODO)
            ),
            in_progress_tasks=Count(
                "tasks",
                filter=Q(tasks__status=Task.Status.IN_PROGRESS)
            ),
            completed_tasks=Count(
                "tasks",
                filter=Q(tasks__status=Task.Status.COMPLETED)
            )
        ).order_by("-created_at")

        project_data = []

        for project in projects:
            project_data.append({
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "owner": project.owner.id,
                "total_tasks": project.total_tasks,
                "todo_tasks": project.todo_tasks,
                "in_progress_tasks": project.in_progress_tasks,
                "completed_tasks": project.completed_tasks
            })

        return Response({
            "total_projects": len(project_data),
            "total_tasks": sum(
                project["total_tasks"] for project in project_data
            ),
            "projects": project_data
        }, status=status.HTTP_200_OK)



    @action(
        detail=True,
        methods=["get"],
        url_path="available-users",
        permission_classes=[IsAuthenticated],
    )
    def available_users(self, request, *args, **kwargs):
        project = self.get_object()

        # Only the project owner can search for users to add.
        if project.owner_id != request.user.id:
            return Response(
                {"detail": "Only the project owner can add members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        search = request.query_params.get("search", "").strip()

        existing_member_ids = ProjectMember.objects.filter(
            project=project
        ).values_list("user_id", flat=True)

        users = User.objects.filter(
            is_active=True
        ).exclude(
            id__in=existing_member_ids
        )

        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        users = users.order_by("username")[:10]

        serializer = AvailableUserSerializer(users, many=True)

        return Response({"results": serializer.data})


    @action(
        detail=False,
        methods=["get"],
        url_path="my-tasks",
        permission_classes=[IsAuthenticated]
    )
    def my_tasks(self, request, *args, **kwargs):

        # 1. Validate query parameters
        query_serializer = TaskListQuerySerializer(
            data=request.query_params
        )
        query_serializer.is_valid(raise_exception=True)

        filters = query_serializer.validated_data

        # 2. Get tasks created by or assigned to the logged-in user
        tasks = Task.objects.filter(
            Q(created_by=request.user) |
            Q(assignee=request.user)
        ).select_related(
            "created_by",
            "assignee",
            "project"
        ).order_by("-created_at").distinct()

        # 3. Apply status filter
        status_filter = filters.get("status")
        if status_filter:
            tasks = tasks.filter(status=status_filter)

        # 4. Apply priority filter
        priority_filter = filters.get("priority")
        if priority_filter:
            tasks = tasks.filter(priority=priority_filter)

        # 5. Apply assignee filter
        assignee_filter = filters.get("assignee")
        if assignee_filter:
            tasks = tasks.filter(assignee_id=assignee_filter)

        # 6. Search title and description
        search_query = filters.get("search", "").strip()
        if search_query:
            tasks = tasks.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        # 7. Paginate results
        paginator = TaskPagination()

        paginated_tasks = paginator.paginate_queryset(
            tasks,
            request,
            view=self
        )

        # 8. Serialize results
        serializer = TaskSerializer(
            paginated_tasks,
            many=True
        )

        return paginator.get_paginated_response(serializer.data)