from django.urls import path
from . import views


urlpatterns = [
    path("", views.projects, name="project_main"),
    path("create", views.project_create, name="create_project"),
    path("submit_form", views.submit_form, name="submit_form"),
    path("project/<int:project_id>", views.project_details, name="project_details"),
]