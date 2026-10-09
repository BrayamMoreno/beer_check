from django.conf import settings
from django.contrib import admin
from django.shortcuts import redirect
from django.urls import include, path, re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter

from licores.views import LicorViewSet, TipoLicorViewSet, config

router = DefaultRouter()
router.register("tipos", TipoLicorViewSet, basename="tipo")
router.register("licores", LicorViewSet, basename="licor")

urlpatterns = [
    path("", lambda request: redirect("admin/", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/config/", config),
    path("api/", include(router.urls)),
    re_path(r"^static/(?P<path>.*)$", serve, {"document_root": settings.STATIC_ROOT}),
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
