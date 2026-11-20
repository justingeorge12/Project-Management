
import uuid

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import ProjectMember
from projects.services import create_project
from tasks.models import Task

User = get_user_model()


class TaskAPITests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="StrongPassword@123"
        )

        self.assignee = User.objects.create_user(
            username="assignee",
            email="assignee@example.com",
            password="StrongPassword@123"
        )

        self.other_member = User.objects.create_user(
            username="othermember",
            email="other@example.com",
            password="StrongPassword@123"
        )

        self.outsider = User.objects.create_user(
            username="outsider",
            email="outsider@example.com",
            password="StrongPassword@123"
        )

        self.project = create_project(
            name="TaskFlow Project",
            description="Testing task APIs",
            owner=self.owner
        )

        # Add project members.
        ProjectMember.objects.create(
            project=self.project,
            user=self.assignee
        )

        ProjectMember.objects.create(
            project=self.project,
            user=self.other_member
        )

        self.tasks_url = (
            f"/api/projects/{self.project.id}/tasks/"
        )

        self.client.force_authenticate(user=self.owner)

        # Create a default TODO task for detail tests.
        self.task = Task.objects.create(
            project=self.project,
            title="Test Task",
            description="Testing task functionality",
            created_by=self.owner,
            assignee=self.assignee,
            priority=Task.Priority.MEDIUM,
            status=Task.Status.TODO
        )

        self.task_detail_url = (
            f"/api/projects/{self.project.id}/tasks/{self.task.id}/"
        )

    # --------------------------------------------------
    # TASK CREATION
    # --------------------------------------------------

    def test_project_member_can_create_task(self):
        """A project member should be able to create a task."""

        response = self.client.post(
            self.tasks_url,
            {
                "title": "New Task",
                "description": "Created through API",
                "priority": "HIGH",
                "assignee": str(self.assignee.id)
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Task.objects.filter(
                project=self.project,
                title="New Task",
                created_by=self.owner
            ).exists()
        )

    def test_non_member_cannot_create_task(self):
        """A user who is not a project member cannot create tasks."""

        self.client.force_authenticate(user=self.outsider)

        response = self.client.post(
            self.tasks_url,
            {
                "title": "Unauthorized Task",
                "description": "Should not be created"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_task_cannot_be_assigned_to_non_member(self):
        """A task cannot be assigned to a non-project member."""

        response = self.client.post(
            self.tasks_url,
            {
                "title": "Invalid Assignment",
                "assignee": str(self.outsider.id)
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_task_cannot_be_created_with_completed_status(self):
        """A task should not be created directly as completed."""

        response = self.client.post(
            self.tasks_url,
            {
                "title": "Completed Task",
                "assignee": str(self.assignee.id),
                "status": Task.Status.COMPLETED
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------
    # TASK RETRIEVAL
    # --------------------------------------------------

    def test_project_member_can_list_tasks(self):
        """A project member should be able to list project tasks."""

        response = self.client.get(self.tasks_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_project_member_can_retrieve_task(self):
        """A project member should be able to retrieve a task."""

        response = self.client.get(self.task_detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(response.data["title"], "Test Task")

    def test_non_member_cannot_retrieve_task(self):
        """A non-member should not be able to retrieve project tasks."""

        self.client.force_authenticate(user=self.outsider)

        response = self.client.get(self.task_detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    # --------------------------------------------------
    # TASK UPDATE
    # --------------------------------------------------

    def test_task_creator_can_update_task(self):
        """The task creator should be able to update the task."""

        response = self.client.patch(
            self.task_detail_url,
            {"title": "Updated by Creator"},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.task.refresh_from_db()

        self.assertEqual(self.task.title, "Updated by Creator")

    def test_task_assignee_can_update_task(self):
        """The assigned user should be able to update the task."""

        self.client.force_authenticate(user=self.assignee)

        response = self.client.patch(
            self.task_detail_url,
            {"title": "Updated by Assignee"},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.task.refresh_from_db()

        self.assertEqual(self.task.title, "Updated by Assignee")

    def test_other_project_member_cannot_update_task(self):
        """A member who is neither creator nor assignee cannot update."""

        self.client.force_authenticate(user=self.other_member)

        response = self.client.patch(
            self.task_detail_url,
            {"title": "Unauthorized Update"},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    # --------------------------------------------------
    # TASK DELETION
    # --------------------------------------------------

    def test_project_owner_can_delete_todo_task(self):
        """The project owner can delete a TODO task."""

        response = self.client.delete(self.task_detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(
            Task.objects.filter(id=self.task.id).exists()
        )

    def test_non_owner_cannot_delete_todo_task(self):
        """A non-owner cannot delete a TODO task."""

        self.client.force_authenticate(user=self.assignee)

        response = self.client.delete(self.task_detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.assertTrue(
            Task.objects.filter(id=self.task.id).exists()
        )

    def test_owner_cannot_delete_in_progress_task(self):
        """Only TODO tasks can be deleted."""

        self.task.status = Task.Status.IN_PROGRESS
        self.task.save()

        response = self.client.delete(self.task_detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertTrue(
            Task.objects.filter(id=self.task.id).exists()
        )

    # --------------------------------------------------
    # TASK COMPLETION
    # --------------------------------------------------

    def test_task_cannot_be_completed_without_assignee(self):
        """A task must have an assignee before completion."""

        self.task.assignee = None
        self.task.save()

        response = self.client.patch(
            self.task_detail_url,
            {"status": Task.Status.COMPLETED},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_assigned_task_can_be_completed(self):
        """A task with an assignee and title can be completed."""

        response = self.client.patch(
            self.task_detail_url,
            {"status": Task.Status.COMPLETED},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.task.refresh_from_db()

        self.assertEqual(
            self.task.status,
            Task.Status.COMPLETED
        )

    # --------------------------------------------------
    # TASK FILTERING
    # --------------------------------------------------

    def test_filter_tasks_by_status(self):
        """Tasks should be filterable by status."""

        response = self.client.get(
            self.tasks_url,
            {"status": Task.Status.TODO}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_filter_tasks_by_priority(self):
        """Tasks should be filterable by priority."""

        response = self.client.get(
            self.tasks_url,
            {"priority": Task.Priority.MEDIUM}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_filter_tasks_by_assignee(self):
        """Tasks should be filterable by assigned user."""

        response = self.client.get(
            self.tasks_url,
            {"assignee": str(self.assignee.id)}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_filter_tasks_by_nonexistent_assignee(self):
        """Filtering by an unknown user should return no tasks."""

        response = self.client.get(
            self.tasks_url,
            {"assignee": str(uuid.uuid4())}
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data["results"]), 0)


        
