from django.urls import path
from . import views


urlpatterns = [
    path("", views.projects, name="project_main"),
    path("create", views.project_create, name="create_project"),
    path("submit_form", views.submit_form, name="submit_form"),
    path('project_data/<int:project_id>/', views.get_project_data, name='get_project_data'),
    path('filter_projects/', views.filter_projects, name='filter_projects'),
    path('update_project_status/', views.update_project_status, name='update_project_status'),
    path('delete_project_file/', views.delete_project_file, name='delete_project_file'),
    path('upload_project_files/', views.upload_project_files, name='upload_project_files'),

]