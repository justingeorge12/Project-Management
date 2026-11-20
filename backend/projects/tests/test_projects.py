

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project, ProjectMember
from projects.services import create_project

User = get_user_model()


class ProjectAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="StrongPassword@123"
        )

        self.other_user = User.objects.create_user(
            username="member",
            email="member@example.com",
            password="StrongPassword@123"
        )

        self.client.force_authenticate(user=self.user)

        # Create a project for the test owner.
        # The service should automatically add the owner as a member.
        self.project = create_project(
            name="TaskFlow Project",
            description="Testing project APIs",
            owner=self.user
        )

        self.project_url = f"/api/projects/{self.project.id}/"

    def test_create_project(self):
        """An authenticated user should be able to create a project."""

        response = self.client.post(
            "/api/projects/",
            {
                "name": "New Project",
                "description": "My new project"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Project.objects.filter(
                name="New Project",
                owner=self.user
            ).exists()
        )

    def test_project_owner_is_automatically_added_as_member(self):
        """The project owner should automatically become a member."""

        self.assertTrue(
            ProjectMember.objects.filter(
                project=self.project,
                user=self.user
            ).exists()
        )

    def test_user_can_list_only_their_projects(self):
        """Users should only see projects they belong to."""

        other_project = create_project(
            name="Other Project",
            description="Another user's project",
            owner=self.other_user
        )

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        project_ids = [item["id"] for item in response.data]

        self.assertIn(str(self.project.id), project_ids)
        self.assertNotIn(str(other_project.id), project_ids)

    def test_project_owner_can_retrieve_project(self):
        """A project member should be able to retrieve project details."""

        response = self.client.get(self.project_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.project.name)

    def test_project_owner_can_update_project(self):
        """The project owner should be able to update project details."""

        response = self.client.patch(
            self.project_url,
            {"name": "Updated Project"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.project.refresh_from_db()

        self.assertEqual(self.project.name, "Updated Project")

    def test_non_owner_cannot_update_project(self):
        """A project member who is not the owner cannot update it."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.other_user
        )

        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            self.project_url,
            {"name": "Unauthorized Update"},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_non_member_cannot_retrieve_project(self):
        """A user who is not a member should not access the project."""

        response = self.client.get(self.project_url)

        # The user in setUp is the owner, so switch to another user
        # who is not a member.
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(self.project_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_project_owner_can_delete_project(self):
        """The project owner should be able to delete their project."""

        response = self.client.delete(self.project_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            Project.objects.filter(id=self.project.id).exists()
        )

    def test_unauthenticated_user_cannot_access_projects(self):
        """Unauthenticated users should not access project APIs."""

        self.client.force_authenticate(user=None)

        response = self.client.get("/api/projects/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
