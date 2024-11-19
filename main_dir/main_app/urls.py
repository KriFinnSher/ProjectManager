from django.urls import path
from . import views


urlpatterns = [
    path("", views.index, name="main_page"),
    path("help/", views.help, name="help"),
    path("rating/", views.rating, name="rating")
]