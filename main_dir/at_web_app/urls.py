from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from . import views


urlpatterns = ([
    path("", include("main_app.urls")),
    path("admin/", admin.site.urls),
    path("projects/", include("projects.urls")),
    path('accounts/', include('django.contrib.auth.urls')),
    path("profile/", views.profile_view, name="profile"),
    path('register/', views.register_user, name='register'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
               )

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)