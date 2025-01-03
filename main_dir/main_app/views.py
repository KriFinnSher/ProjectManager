import csv
from django.http import HttpResponse, JsonResponse
from . import Services
from django.shortcuts import render
from projects.models import Project, TeamMember, ProjectFile
from django.db.models import Case, When, Value, IntegerField


def index(request):
    return render(request, 'main_app/main_page.html')


def help(request):
    return render(request, 'main_app/help.html')


def tables(request):
    tables = Services.show_all_projects(request)
    return render(request, 'main_app/tables.html', {'tables': tables})

def news(request):
    return render(request, 'main_app/news.html')


def filter_tables(request):
    group_filter = request.GET.get('group', 'all_groups')
    subject_filter = request.GET.get('subject', 'all_subjects')
    sort_filter = request.GET.get('sort', 'name_sort')

    projects = Project.objects.all()

    if group_filter != 'all_groups':
        projects = projects.filter(
            team__members__role='Лидер',
            team__members__user__university_group=group_filter
        )

    if subject_filter != 'all_subjects':
        projects = projects.filter(subject=subject_filter)

    if sort_filter in ['status_sort_inc', 'status_sort_dec']:
        status_order = {'не начат': 1, 'в процессе': 2, 'почти закончен': 3, 'завершен': 4}
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
            'team': project.team.team_name,
            'group': '',
        }
        for project in projects
    ]

    for table in tables:
        for t in TeamMember.objects.all():
            if t.role == 'Лидер' and t.team.team_name == table['team']:
                table['group'] = t.user.university_group


    return JsonResponse({'tables': tables})


def export_file(request):
    group_filter = request.GET.get('group', 'all_groups')
    subject_filter = request.GET.get('subject', 'all_subjects')
    sort_filter = request.GET.get('sort', 'name_sort')

    projects = Project.objects.all()

    if group_filter != 'all_groups':
        projects = projects.filter(
            team__members__role='Лидер',
            team__members__user__university_group=group_filter
        )

    if subject_filter != 'all_subjects':
        projects = projects.filter(subject=subject_filter)

    if sort_filter in ['status_sort_inc', 'status_sort_dec']:
        status_order = {'не начат': 1, 'в процессе': 2, 'почти закончен': 3, 'завершен': 4}
        projects = projects.annotate(status_order=Case(
            *[When(status=k, then=Value(v)) for k, v in status_order.items()],
            output_field=IntegerField()
        )).order_by('status_order' if sort_filter == 'status_sort_inc' else '-status_order')
    else:
        projects = projects.order_by('theme')

    response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
    response['Content-Disposition'] = f'attachment; filename="{group_filter}_{subject_filter}.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Theme', 'Subject', 'Status', 'Team', 'Group'])

    for project in projects:
        group = ''
        for t in TeamMember.objects.all():
            if t.role == 'Лидер' and t.team.team_name == project.team.team_name:
                group = t.user.university_group
                break

        writer.writerow([project.id, project.theme, project.subject, project.status, project.team.team_name, group])

    return response

