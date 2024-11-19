from django.shortcuts import render, get_object_or_404, redirect
from .models import Project
from . import services


def projects(request):
    return render(request, 'projects/project_main.html')


def project_create(request):
    return render(request, 'projects/project_create.html')


def submit_form(request):
    if request.method == "POST":
        project_id = services.create_project(request)
        return redirect("project_details", project_id=project_id)

    return render(request, 'projects/project_main.html')


def project_details(request,project_id):
    project = get_object_or_404(Project, id=project_id)
    return render(request, 'projects/project_details.html', {'project': project})