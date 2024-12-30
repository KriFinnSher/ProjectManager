from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from registration.forms import ProfileForm, RegistrationForm
from django.contrib.auth import login
from projects.models import Project

@login_required
def profile_view(request):
    user = request.user
    user_projects_num = len(Project.objects.filter(team__members__user=user))
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileForm(instance=request.user)

    return render(request, 'registration/profile.html', {'form': form, 'user': user, 'user_projects_num': user_projects_num})

def register_user(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/')
    else:
        form = RegistrationForm()

    return render(request, 'registration/register.html', {'form': form})
