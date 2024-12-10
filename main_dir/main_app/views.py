from . import Services
from django.shortcuts import render
from projects.models import Project, TeamMember, ProjectFile
from django.http import JsonResponse
from django.db.models import Case, When, Value, IntegerField


def index(request):
    return render(request, 'main_app/main_page.html')


def help(request):
    return render(request, 'main_app/help.html')


def tables(request):
    tables = Services.show_all_projects(request)
    return render(request, 'main_app/tables.html', {'tables': tables})


def filter_tables(request):
    group_filter = request.GET.get('group', 'all_groups')
    subject_filter = request.GET.get('subject', 'all_subjects')
    sort_filter = request.GET.get('sort', 'name_sort')

    projects = Project.objects.all()

    if group_filter != 'all_groups':
        projects = projects.filter(
            team__members__role='leader',
            team__members__user__university_group=group_filter
        )

    if subject_filter != 'all_subjects':
        projects = projects.filter(subject=subject_filter)

    if sort_filter in ['status_sort_inc', 'status_sort_dec']:
        status_order = {'not_started': 1, 'in_progress': 2, 'almost_done': 3, 'completed': 4}
        projects = projects.annotate(status_order=Case(
            *[When(status=k, then=Value(v)) for k, v in status_order.items()],
            output_field=IntegerField()
        )).order_by('status_order' if sort_filter == 'status_sort_inc' else '-status_order')
    else:
        projects = projects.order_by('theme')

    tables = [
        {
            'id': project.id,
            'theme': project.theme,
            'subject': project.subject,
            'status': project.status,
        }
        for project in projects
    ]

    return JsonResponse({'tables': tables})
