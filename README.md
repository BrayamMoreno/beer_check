# Licores pH · PWA

Selecciona un licor (SQLite) → verifica manualmente en [syctrace.org](https://syctrace.org/) → consulta sus datos de pH.

## Backend (Django + DRF + SQLite)
```powershell
cd backend
.\.venv\Scripts\activate
python manage.py migrate
python manage.py seed_licores        # datos de ejemplo
python manage.py createsuperuser     # si no existe
python manage.py runserver
```
- Admin: http://127.0.0.1:8000/admin/
- API: `/api/tipos/`, `/api/licores/?tipo=<id>`, `/api/licores/<id>/ph/`, `/api/config/`

## Frontend (Vite + React + vite-plugin-pwa)
```powershell
cd frontend
npm install
npm run dev      # http://localhost:5173 (proxy /api y /media -> Django :19820)
```
Para instalarla como PWA en el celular se necesita HTTPS (o `localhost`).

## Docker Compose
Los contenedores se conectan a la red externa `proxy_network`:
- **Backend:** puerto `19820` (Gunicorn / API / Admin)
- **Frontend:** puerto `19821` (Nginx PWA + reverse proxy interno hacia el backend)

Antes de levantar:
```bash
docker network create proxy_network # si aún no existe
docker compose up -d --build
```
