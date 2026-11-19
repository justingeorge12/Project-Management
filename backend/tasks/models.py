from django.db import models

# Create your models here.



import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Task(models.Model):

    class Status(models.TextChoices):
        TODO = "TODO", "Todo"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    title = models.CharField(max_length=255)

    description = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_tasks"
    )

    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks"
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()

        if self.assignee_id and self.project_id:
            is_member = self.project.members.filter(
                user_id=self.assignee_id
            ).exists()

            if not is_member:
                raise ValidationError({
                    "assignee": "The assigned user must be a member of this project."
                })

    def __str__(self):
        return self.title
