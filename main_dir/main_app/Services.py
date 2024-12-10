from projects.models import Team, TeamMember, Project, User


def show_all_projects(request):
    all_projects = Project.objects.all()
    print(all_projects)

    return all_projects
