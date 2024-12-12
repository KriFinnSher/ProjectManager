from django.urls import path
from . import views


urlpatterns = [
    path("", views.index, name="main_page"),
    path("help/", views.help, name="help"),
    path("tables/", views.tables, name="tables"),
    path("tables/filter_tables", views.filter_tables, name="filter_tables"),
    path('tables/export_file/', views.export_file, name="export_file"),
]