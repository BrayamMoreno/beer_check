from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Licor, TipoLicor
from .serializers import LicorListSerializer, LicorPhSerializer, TipoLicorSerializer


class TipoLicorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoLicor.objects.all()
    serializer_class = TipoLicorSerializer
    pagination_class = None


class LicorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/licores/?tipo=<id>   -> lista para seleccionar
    GET /api/licores/<id>/        -> detalle básico
    GET /api/licores/<id>/ph/     -> datos de pH (tras verificación manual en SycTrace)
    """

    serializer_class = LicorListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Licor.objects.filter(activo=True).select_related("tipo")
        tipo = self.request.query_params.get("tipo")
        if tipo:
            qs = qs.filter(tipo_id=tipo)
        return qs

    @action(detail=True, methods=["get"])
    def ph(self, request, pk=None):
        return Response(LicorPhSerializer(self.get_object(), context={"request": request}).data)


@api_view(["GET"])
def config(request):
    return Response({"syctrace_url": settings.SYCTRACE_URL})
