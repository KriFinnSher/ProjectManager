from .models import Team, TeamMember, Project, User


def create_project(request):
    team_name = request.POST["team_name"]
    project_theme = request.POST["project_name"]
    subject = request.POST["subject"]
    team_type = request.POST["project_type"]
    project_status = request.POST["status"]

    team = Team.objects.create(
        team_name=team_name,
        team_type=team_type
    )

    participants = request.POST.getlist('participant_name')[1:]

    for i, participant_line in enumerate(participants):
        participant, role = participant_line.split(',')
        user = User.objects.get(full_name=participant)
        TeamMember.objects.create(user=user, team=team, role=role)

    project = Project.objects.create(
        theme=project_theme,
        subject=subject,
        status=project_status,
        team=team
    )

    return project.id








