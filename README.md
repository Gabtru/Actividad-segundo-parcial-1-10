
# Flask MVC Login + Menu (Docker-ready)

Proyecto base en Flask con estructura Modelo-Vista-Controlador (MVC), login y menú tras autenticación.
Incluye `Dockerfile`, `docker-compose.yml`, y `.env.example`.

## Estructura
```
flask_mvc_login/
├─ app/
│  ├─ __init__.py
│  ├─ models.py
│  ├─ controllers/
│  │  ├─ auth.py
│  │  └─ main.py
│  ├─ templates/
│  │  ├─ base.html
│  │  ├─ login.html
│  │  └─ menu.html
│  └─ static/
├─ wsgi.py
├─ requirements.txt
├─ Dockerfile
├─ docker-compose.yml
├─ .env.example
├─ run.py
└─ README.md
```

## Inicio rápido (sin Docker)
```bash
python -m venv .venv
source .venv/bin/activate  # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # edita si quieres
python run.py
# Abre http://localhost:5000
```

## Con Docker
```bash
cp .env.example .env  # edita si quieres
docker compose up --build
# Abre http://localhost:5000
```

## Credenciales por defecto
- Usuario: `admin@example.com`
- Password: `admin123`

> Puedes cambiarlas con variables de entorno `ADMIN_EMAIL` y `ADMIN_PASSWORD` o editando `.env`.

## Crear un usuario adicional (opcional)
```bash
# Con el entorno activado:
flask --app wsgi.py create-user you@example.com tu_password
```


---

### Notas de SQLite
- Se usa `sqlite:///app.db` por defecto (archivo en la raíz del proyecto).
- Puedes apuntar a otro archivo local con `DATABASE_URL=sqlite:////ruta/absoluta/app.db`.
- La base se crea automáticamente al arrancar si no existe.


## Inicializar la base de datos (semillas incluidas)
Opciones:
1) **Automático al arrancar:** si la base no existe, se crea y se añaden productos demo.
2) **Manual (reinicia y siembra):**
```bash
# Sin Docker
flask --app wsgi.py init-db

# Con Docker
docker compose run --rm web flask --app wsgi.py init-db
```
