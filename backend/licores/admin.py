from django.contrib import admin
from django.utils.html import format_html

from .models import Licor, TipoLicor

admin.site.site_header = "Licores · pH — Administración"
admin.site.site_title = "Licores pH"
admin.site.index_title = "Gestión de licores y datos de pH"


@admin.register(TipoLicor)
class TipoLicorAdmin(admin.ModelAdmin):
    list_display = ("icono", "nombre", "total_licores")
    search_fields = ("nombre",)

    @admin.display(description="Licores")
    def total_licores(self, obj):
        return obj.licores.count()


@admin.register(Licor)
class LicorAdmin(admin.ModelAdmin):
    list_display = ("miniatura", "nombre", "marca", "tipo", "grado_alcoholico",
                    "ph_minimo", "ph_promedio", "ph_maximo", "activo")
    list_display_links = ("miniatura", "nombre")
    list_filter = ("tipo", "activo")
    list_editable = ("activo",)
    search_fields = ("nombre", "marca", "descripcion")
    readonly_fields = ("creado", "actualizado", "miniatura")
    fieldsets = (
        ("Información general", {"fields": ("nombre", "tipo", "marca", "grado_alcoholico", "descripcion", "activo")}),
        ("Datos de pH", {"fields": (("ph_minimo", "ph_promedio", "ph_maximo"),)}),
        ("Imagen", {
            "fields": ("imagen", "imagen_url", "miniatura"),
            "description": "Sube un archivo o pega una URL pública. El archivo tiene prioridad.",
        }),
        ("Auditoría", {"fields": ("creado", "actualizado"), "classes": ("collapse",)}),
    )

    @admin.display(description="Imagen")
    def miniatura(self, obj):
        src = obj.imagen_fuente
        if src:
            return format_html('<img src="{}" style="height:48px;border-radius:6px" />', src)
        return "—"
