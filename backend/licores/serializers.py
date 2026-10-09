from rest_framework import serializers

from .models import Licor, TipoLicor


class TipoLicorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoLicor
        fields = ["id", "nombre", "icono"]


class ImagenMixin(serializers.Serializer):
    """Expone `imagen` como URL absoluta: archivo subido o URL pública."""

    imagen = serializers.SerializerMethodField()

    def get_imagen(self, obj):
        if obj.imagen:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.imagen.url) if request else obj.imagen.url
        return obj.imagen_url or None


class LicorListSerializer(ImagenMixin, serializers.ModelSerializer):
    """Datos públicos para la selección (sin pH: se revela tras verificar)."""

    tipo = TipoLicorSerializer(read_only=True)

    class Meta:
        model = Licor
        fields = ["id", "nombre", "marca", "tipo", "grado_alcoholico", "imagen"]


class LicorPhSerializer(ImagenMixin, serializers.ModelSerializer):
    tipo = TipoLicorSerializer(read_only=True)

    class Meta:
        model = Licor
        fields = ["id", "nombre", "marca", "tipo", "grado_alcoholico", "imagen", "descripcion",
                  "ph_minimo", "ph_maximo", "ph_promedio", "actualizado"]
