from django.contrib import admin

from .models import Team, TeamMember, Project, User, ProjectFile

admin.site.register(Team)
admin.site.register(TeamMember)
admin.site.register(Project)
admin.site.register(User)
admin.site.register(ProjectFile)
