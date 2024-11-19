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
        user.save(using=self._db)
        return user

    def create_superuser(self, full_name, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(full_name, email, password, **extra_fields)


class User(AbstractUser):
    full_name = models.CharField(max_length=150, unique=True)
    university_group = models.CharField(max_length=100)
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'full_name'
    REQUIRED_FIELDS = ['email']

    objects = CustomUserManager()

    def __str__(self):
        return self.full_name


class Team(models.Model):
    TEAM_TYPES = [
        ('solo_project', 'Solo Project'),
        ('group_project', 'Group Project'),
    ]

    team_name = models.CharField(max_length=40)
    team_type = models.CharField(max_length=20, choices=TEAM_TYPES)

    def __str__(self):
        return self.team_name



class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('leader', 'Leader'),
        ('member', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    def __str__(self):
        return f'{self.user} [{self.team}]'



class Project(models.Model):
    theme = models.CharField(max_length=50)
    subject = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='projects')

    def __str__(self):
        return f'{self.subject} [{self.theme}]'
