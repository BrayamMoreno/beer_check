from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

PH_VALIDATORS = [MinValueValidator(0), MaxValueValidator(14)]


class TipoLicor(models.Model):
    """Categoría de licor: ron, aguardiente, whisky, etc."""

    nombre = models.CharField(max_length=60, unique=True)
    icono = models.CharField(max_length=8, blank=True, help_text="Emoji opcional, ej: 🥃")

    class Meta:
        verbose_name = "tipo de licor"
        verbose_name_plural = "tipos de licor"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Licor(models.Model):
    nombre = models.CharField(max_length=120)
    tipo = models.ForeignKey(TipoLicor, on_delete=models.PROTECT, related_name="licores")
    marca = models.CharField(max_length=120)
    grado_alcoholico = models.DecimalField(
        "grado alcohólico (% vol)", max_digits=4, decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    ph_minimo = models.DecimalField("pH mínimo", max_digits=4, decimal_places=2, validators=PH_VALIDATORS)
    ph_maximo = models.DecimalField("pH máximo", max_digits=4, decimal_places=2, validators=PH_VALIDATORS)
    ph_promedio = models.DecimalField("pH promedio", max_digits=4, decimal_places=2, validators=PH_VALIDATORS)
    descripcion = models.TextField("descripción", blank=True)
    imagen = models.ImageField(
        upload_to="licores/", blank=True, null=True,
        help_text="Imagen subida. Si se define, tiene prioridad sobre la URL.",
    )
    imagen_url = models.URLField(
        "URL de imagen", max_length=500, blank=True,
        help_text="URL pública de una imagen (https://...). Se usa si no hay imagen subida.",
    )
    activo = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "licor"
        verbose_name_plural = "licores"
        ordering = ["tipo__nombre", "nombre"]

    def __str__(self):
        return f"{self.nombre} ({self.marca})"

    @property
    def imagen_fuente(self):
        """Ruta relativa del archivo subido o la URL pública (o None)."""
        if self.imagen:
            return self.imagen.url
        return self.imagen_url or None

    def clean(self):
        if None in (self.ph_minimo, self.ph_maximo, self.ph_promedio):
            return
        if self.ph_minimo > self.ph_maximo:
            raise ValidationError({"ph_maximo": "El pH máximo debe ser mayor o igual al mínimo."})
        if not (self.ph_minimo <= self.ph_promedio <= self.ph_maximo):
            raise ValidationError({"ph_promedio": "El pH promedio debe estar entre el mínimo y el máximo."})
