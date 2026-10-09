from decimal import Decimal as D

from django.core.management.base import BaseCommand

from licores.models import Licor, TipoLicor

# Valores de pH aproximados de referencia (datos de ejemplo, edítalos en el admin)
DATOS = {
    ("Aguardiente", "🌿"): [
        ("Aguardiente Antioqueño Tapa Azul", "Fábrica de Licores de Antioquia", "24.0", "4.20", "5.10", "4.60"),
        ("Aguardiente Néctar", "Empresa de Licores de Cundinamarca", "29.0", "4.10", "5.00", "4.55"),
    ],
    ("Ron", "🏝️"): [
        ("Ron Viejo de Caldas 3 años", "Industria Licorera de Caldas", "35.0", "4.30", "5.20", "4.70"),
        ("Ron Medellín Añejo", "Fábrica de Licores de Antioquia", "35.0", "4.20", "5.00", "4.60"),
    ],
    ("Whisky", "🥃"): [
        ("Old Parr 12 años", "Diageo", "40.0", "3.90", "4.60", "4.20"),
        ("Johnnie Walker Black Label", "Diageo", "40.0", "3.80", "4.50", "4.10"),
    ],
    ("Vodka", "🧊"): [
        ("Absolut", "The Absolut Company", "40.0", "6.50", "7.80", "7.10"),
    ],
    ("Tequila", "🌵"): [
        ("José Cuervo Especial", "Casa Cuervo", "38.0", "3.80", "4.80", "4.30"),
    ],
    ("Vino", "🍷"): [
        ("Vino Tinto Gato Negro", "Viña San Pedro", "13.0", "3.30", "3.80", "3.55"),
    ],
}


class Command(BaseCommand):
    help = "Carga datos de ejemplo de tipos de licor y valores de pH"

    def handle(self, *args, **opts):
        n = 0
        for (tipo_nombre, icono), licores in DATOS.items():
            tipo, _ = TipoLicor.objects.get_or_create(nombre=tipo_nombre, defaults={"icono": icono})
            for nombre, marca, grado, pmin, pmax, pprom in licores:
                _, creado = Licor.objects.get_or_create(
                    nombre=nombre,
                    defaults=dict(tipo=tipo, marca=marca, grado_alcoholico=D(grado),
                                  ph_minimo=D(pmin), ph_maximo=D(pmax), ph_promedio=D(pprom),
                                  descripcion=f"{tipo_nombre} de referencia - datos de ejemplo."),
                )
                n += creado
        self.stdout.write(self.style.SUCCESS(f"Listo: {n} licores creados."))
