from django.contrib.auth.views import LogoutView
from django.urls import path
from django.contrib.auth import views as auth_views



urlpatterns = [
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', auth_views.LoginView.as_view(), name='login'),

]