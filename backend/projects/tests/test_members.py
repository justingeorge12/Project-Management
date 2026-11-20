

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project, ProjectMember
from projects.services import create_project

User = get_user_model()


class ProjectMemberAPITests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="StrongPassword@123"
        )

        self.member = User.objects.create_user(
            username="member",
            email="member@example.com",
            password="StrongPassword@123"
        )

        self.non_member = User.objects.create_user(
            username="outsider",
            email="outsider@example.com",
            password="StrongPassword@123"
        )

        self.project = create_project(
            name="TaskFlow Project",
            description="Testing project membership",
            owner=self.owner
        )

        self.members_url = (
            f"/api/projects/{self.project.id}/members/"
        )

        self.remove_member_url = (
            f"/api/projects/{self.project.id}/members/"
            f"{self.member.id}/"
        )

        self.client.force_authenticate(user=self.owner)

    def test_owner_can_add_member(self):
        """The project owner should be able to add a member."""

        response = self.client.post(
            self.members_url,
            {"user_id": str(self.member.id)},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            ProjectMember.objects.filter(
                project=self.project,
                user=self.member
            ).exists()
        )

    def test_owner_can_list_members(self):
        """The project owner should be able to list members."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.member
        )

        response = self.client.get(self.members_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_user_ids = [
            item["user"]["id"] for item in response.data
        ]

        self.assertIn(str(self.owner.id), returned_user_ids)
        self.assertIn(str(self.member.id), returned_user_ids)

    def test_duplicate_member_cannot_be_added(self):
        """Adding an existing member should return a validation error."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.member
        )

        response = self.client.post(
            self.members_url,
            {"user_id": str(self.member.id)},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_nonexistent_user_cannot_be_added(self):
        """A user who does not exist cannot be added."""

        import uuid

        response = self.client.post(
            self.members_url,
            {"user_id": str(uuid.uuid4())},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_non_owner_cannot_add_member(self):
        """Only the project owner can add members."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.member
        )

        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.members_url,
            {"user_id": str(self.non_member.id)},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_owner_can_remove_member(self):
        """The project owner should be able to remove a member."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.member
        )

        response = self.client.delete(self.remove_member_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(
            ProjectMember.objects.filter(
                project=self.project,
                user=self.member
            ).exists()
        )

    def test_non_owner_cannot_remove_member(self):
        """A regular project member cannot remove another member."""

        ProjectMember.objects.create(
            project=self.project,
            user=self.member
        )

        self.client.force_authenticate(user=self.member)

        response = self.client.delete(self.remove_member_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.assertTrue(
            ProjectMember.objects.filter(
                project=self.project,
                user=self.member
            ).exists()
        )

    def test_owner_cannot_remove_themselves(self):
        """The project owner should not be able to remove themselves."""

        owner_remove_url = (
            f"/api/projects/{self.project.id}/members/"
            f"{self.owner.id}/"
        )

        response = self.client.delete(owner_remove_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertTrue(
            ProjectMember.objects.filter(
                project=self.project,
                user=self.owner
            ).exists()
        )

    def test_removing_nonexistent_member_returns_404(self):
        """Removing a user who is not a member should return 404."""

        response = self.client.delete(self.remove_member_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_unauthenticated_user_cannot_access_members(self):
        """Unauthenticated users cannot access membership APIs."""

        self.client.force_authenticate(user=None)

        response = self.client.get(self.members_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
