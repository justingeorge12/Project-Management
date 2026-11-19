

from django.db import transaction

from .models import Project, ProjectMember


@transaction.atomic
def create_project(*, name, description, owner):

    project = Project.objects.create(
        name=name,
        description=description,
        owner=owner
    )

    ProjectMember.objects.create(
        project=project,
        user=owner
    )

    return project
