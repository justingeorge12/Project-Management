
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    # These fields are returned in the response but cannot be supplied
    # or changed by the client.
    project = serializers.UUIDField(source="project.id", read_only=True)
    created_by = serializers.UUIDField(source="created_by.id", read_only=True)

    # The client sends the assignee's UUID.
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "title",
            "description",
            "created_by",
            "assignee",
            "priority",
            "status",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate_assignee(self, assignee):
        # No assignee is perfectly valid.
        if assignee is None:
            return assignee

        project = self.context["project"]

        if project is None and self.instance:
            project = self.instance.project

        if not project:
            raise serializers.ValidationError(
                "Project context is required."
            )

        is_member = project.members.filter(user=assignee).exists()

        if not is_member:
            raise serializers.ValidationError(
                "The assigned user must be a member of this project."
            )

        return assignee

    def validate(self, attrs):

        # Determine the resulting task status.
        current_status = (
            self.instance.status if self.instance else Task.Status.TODO
        )

        new_status = attrs.get("status", current_status)

        # Do not allow creating an already completed task.
        if self.instance is None and new_status == Task.Status.COMPLETED:
            raise serializers.ValidationError({
                "status": "A task cannot be created with COMPLETED status."
            })

        # Validate task completion.
        if new_status == Task.Status.COMPLETED:

            current_assignee = (
                self.instance.assignee if self.instance else None
            )

            assignee = attrs.get("assignee", current_assignee)

            title = attrs.get(
                "title",
                self.instance.title if self.instance else ""
            )

            if assignee is None:
                raise serializers.ValidationError({
                    "assignee": "A task must have an assignee before completion."
                })

            if not title or not title.strip():
                raise serializers.ValidationError({
                    "title": "Task title is required before completion."
                })

        return attrs


    def create(self, validated_data):
        return Task.objects.create(
            **validated_data,
            project=self.context["project"],
            created_by=self.context["request"].user
        )





class TaskListQuerySerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=Task.Status.choices,
        required=False
    )

    priority = serializers.ChoiceField(
        choices=Task.Priority.choices,
        required=False
    )

    assignee = serializers.UUIDField(
        required=False
    )

    search = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255
    )
