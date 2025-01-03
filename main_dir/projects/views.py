import json
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Project, TeamMember, ProjectFile, User
from . import services
from django.http import JsonResponse
from django.db.models import Case, When, Value, IntegerField, Q
from pathlib import Path


@login_required
def projects(request):
    user_projects = services.show_projects_for_user(request)
    return render(request, 'projects/project_main.html', {'projects': user_projects})


@login_required
def project_create(request):
    return render(request, 'projects/project_create.html')


def submit_form(request):
    if request.method == "POST":
        participants = request.POST.getlist('participant_name')[1:]
        if len(participants) == 0:
            return render(request, 'projects/project_create.html', {
                'participants_error': 'Количество участников должно быть ненулевым',
                    'form_data': request.POST,
            })

        for participant in participants:
            participant = participant.split(',')[0]
            try:
                User.objects.get(full_name=participant)
            except User.DoesNotExist:
                return render(request, 'projects/project_create.html', {
                    'name_error': f'Участник {participant} не найден',
                    'form_data': request.POST,
                })

        project_type = request.POST["project_type"]
        if project_type == "одиночный":
            if len(participants) > 1:
                return render(request, 'projects/project_create.html', {
                    'count_error': f'Одиночный проект предназначен ровно для одного участника',
                    'form_data': request.POST,
                })
        else:
            if len(participants) < 2:
                return render(request, 'projects/project_create.html', {
                    'count_error': f'Групповой проект предназначен минимум для двух участников',
                    'form_data': request.POST,
                })
            if request.POST["team_name"] == '':
                return render(request, 'projects/project_create.html', {
                    'team_name_error': f'Для группового проекта необходимо указать название команды',
                    'form_data': request.POST,
                })

        project_id = services.create_project(request)
        project_instance = Project.objects.get(id=project_id)

        files = request.FILES.getlist('project_files[]')
        for file in files:
            ProjectFile.objects.create(file=file, project=project_instance)

        return redirect("/projects", project_id=project_id)
    return render(request, 'projects/project_main.html')


def get_project_data(request, project_id):
    try:
        project = Project.objects.get(id=project_id)

        is_leader = TeamMember.objects.filter(
            user=request.user,
            team=project.team,
            role='Лидер'
        ).exists()

        participants = TeamMember.objects.filter(team=project.team).select_related('user')
        participant_names = [[member.user.full_name, member.role] for member in participants]

        queryset = ProjectFile.objects.filter(project=project).values(
            'file')
        project_files = [Path(item['file']).name for item in queryset]
        project_files_urls = [f'/media/{item['file']}' for item in queryset]

        project_data = {
            'theme': project.theme,
            'subject': project.subject,
            'status': project.status,
            'participants': participant_names,
            'leader': is_leader,
            'project_files': project_files,
            'project_files_urls': project_files_urls,
        }
        return JsonResponse(project_data)
    except Project.DoesNotExist:
        return JsonResponse({'error': 'Project not found'}, status=404)


def filter_projects(request):
    user = request.user
    state_filter = request.GET.get('state', 'all_aa')
    sort_filter = request.GET.get('sort', 'name_sort')
    status_filter = request.GET.get('status', 'all_status')

    projects = Project.objects.filter(team__members__user=user)

    if state_filter == 'active':
        state_condition = ~Q(status='завершен')
    elif state_filter == 'archive':
        state_condition = Q(status='завершен')
    else:
        state_condition = Q()

    if status_filter == 'не начат':
        status_condition = Q(status='не начат')
    elif status_filter == 'в процессе':
        status_condition = Q(status='в процессе')
    elif status_filter == 'почти закончен':
        status_condition = Q(status='почти закончен')
    elif status_filter == 'завершен':
        status_condition = Q(status='завершен')
    else:
        status_condition = Q()

    projects = projects.filter(state_condition & status_condition)


    if sort_filter in ['status_sort_inc', 'status_sort_dec']:
        status_order = {'не начат': 1, 'в процессе': 2, 'почти закончен': 3, 'завершен': 4}
        projects = projects.annotate(status_order=Case(
            *[When(status=k, then=Value(v)) for k, v in status_order.items()],
            output_field=IntegerField()
        )).order_by('status_order' if sort_filter == 'status_sort_inc' else '-status_order')
    else:
        projects = projects.order_by('theme')


    project_data = [
        {
            'id': project.id,
            'theme': project.theme,
            'subject': project.subject,
            'status': project.status,
        }
        for project in projects
    ]

    return JsonResponse({'projects': project_data})


@csrf_exempt
def update_project_status(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        project_id = data.get('project_id')
        new_status = data.get('status')

        project = Project.objects.get(id=project_id)

        project.status = new_status
        project.save()

        return JsonResponse({'success': True})


@csrf_exempt
def delete_project_file(request):
    data = json.loads(request.body)
    file_name = data['file_name']
    project_file = ProjectFile.objects.get(file=f'project_files/{file_name}')
    os.remove(os.path.join(settings.MEDIA_ROOT, project_file.file.name))
    project_file.delete()
    return JsonResponse({'success': True})


@csrf_exempt
def upload_project_files(request):
    if request.method == 'POST' and request.FILES.getlist('files'):
        files = request.FILES.getlist('files')
        project_id = request.POST.get('project_id')
        project = Project.objects.get(id=project_id)
        for file in files:
            file_path = os.path.join('project_files', file.name)
            file_path = file_path.replace(os.sep, '/')
            with open(os.path.join(settings.MEDIA_ROOT, file_path), 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            ProjectFile.objects.create(file=file_path, project=project)
    return JsonResponse({'success': False})