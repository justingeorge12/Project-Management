

from rest_framework import serializers

from .models import Project, ProjectMember

from django.contrib.auth import get_user_model
User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):

    owner = serializers.UUIDField(
        source="owner.id",
        read_only=True
    )

    class Meta:
        model = Project

        fields = [
            "id",
            "name",
            "description",
            "owner",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "created_at",
            "updated_at",
        ]




class ProjectMemberUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProjectMemberSerializer(serializers.ModelSerializer):

    user_id = serializers.UUIDField(write_only=True)

    user = ProjectMemberUserSerializer(read_only=True)

    project = serializers.UUIDField(
        source="project.id",
        read_only=True
    )

    class Meta:
        model = ProjectMember

        fields = [
            "id",
            "project",
            "user",
            "user_id",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "project",
            "user",
            "joined_at",
        ]

    def validate_user_id(self, value):

        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                "User does not exist."
            )

        if ProjectMember.objects.filter(
            project=self.context["project"],
            user_id=value
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of this project."
            )

        return value

    def create(self, validated_data):

        user_id = validated_data.pop("user_id")

        project = self.context["project"]

        return ProjectMember.objects.create(
            project=project,
            user_id=user_id
        )


class AvailableUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
        ]