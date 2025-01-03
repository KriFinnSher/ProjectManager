from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, full_name, email, password=None, **extra_fields):

        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(full_name=full_name, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, full_name, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(full_name, email, password, **extra_fields)


class User(AbstractUser):
    full_name = models.CharField(max_length=150, unique=True)
    university_group = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    status = models.CharField(max_length=255, blank=True, null=True)

    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.full_name


class Team(models.Model):
    TEAM_TYPES = [
        ('одиночный', 'Одиночный'),
        ('групповой', 'Групповой'),
    ]

    team_name = models.CharField(max_length=40, null=True, blank=True)
    team_type = models.CharField(max_length=20, choices=TEAM_TYPES)

    def __str__(self):
        return f'{self.team_name} [{self.team_type}]'



class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('лидер', 'Лидер'),
        ('участник', 'Участник'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    def __str__(self):
        return f'{self.user} [{self.team}]'



class Project(models.Model):
    STATUS_CHOICES = [
        ('не начат', 'Не начат'),
        ('в процессе', 'В процессе'),
        ('почти закончен', 'Почти закончен'),
        ('завершен', 'Завершен'),
    ]
    theme = models.CharField(max_length=50)
    subject = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='projects')

    def __str__(self):
        return f'{self.subject} [{self.theme}]'


class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="project_files/")

    def __str__(self):
        return f'[{self.project.team}] {self.file.name}'