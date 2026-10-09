from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from licores.views import LicorViewSet, TipoLicorViewSet, config

router = DefaultRouter()
router.register("tipos", TipoLicorViewSet, basename="tipo")
router.register("licores", LicorViewSet, basename="licor")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/config/", config),
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
