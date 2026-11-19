from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import UserRegistrationSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user




class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response({
            "id": str(request.user.id),
            "username": request.user.username,
            "email": request.user.email
        })