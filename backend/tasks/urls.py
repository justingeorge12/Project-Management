
from django.urls import path
from .views import CreateTaskView

urlpatterns = [
    path(
        "projects/<uuid:project_id>/tasks/",
        CreateTaskView.as_view(),
        name="create-task"
    ),
]