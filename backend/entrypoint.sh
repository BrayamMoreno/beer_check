#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput -v 0

# Crea el superusuario si se definen las variables y aún no existe
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
U = get_user_model(); u = os.environ['DJANGO_SUPERUSER_USERNAME']
if not U.objects.filter(username=u).exists():
    U.objects.create_superuser(u, os.getenv('DJANGO_SUPERUSER_EMAIL', ''), os.environ['DJANGO_SUPERUSER_PASSWORD'])
    print('Superusuario creado:', u)
"
fi

# Datos de ejemplo (idempotente)
if [ "$SEED_DATA" = "1" ]; then
  python manage.py seed_licores
fi

exec "$@"
