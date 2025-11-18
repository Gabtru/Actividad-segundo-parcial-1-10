# Práctica 3 — Migración a MVC (Resumen para entrega)

**Proyecto:** flask_mvc_login  
**Autor:** [Tu nombre aquí]  
**Fecha:** 2025-10-29

---

## 1. Resumen ejecutivo
Esta entrega refactoriza la aplicación previa hacia el patrón **Modelo–Vista–Controlador (MVC)** tanto en el backend (Flask) como en el frontend (JavaScript). Mantiene autenticación con Flask-Login, persistencia SQLite mediante SQLAlchemy, y añade separación clara en ficheros estáticos: `app/static/js/model.js`, `view.js`, `controller.js` y `app/static/styles.css`.

### ¿Qué incluye esta entrega?
- Estructura MVC en backend: `app/models.py`, `app/controllers/*`, `app/templates/*`.
- Frontend refactorizado en patrón MVC (JS): `app/static/js/{model,view,controller}.js`.
- CLI reproducible para inicializar DB (`flask --app wsgi.py init-db`) y crear usuarios (`create-user`).
- README con diagrama y justificación de decisiones.

---

## 2. Diagrama arquitectural (Mermaid)
```mermaid
flowchart LR
    subgraph Backend
      A[wsgi.py / create_app()] --> B[Flask app]
      B --> M[Models (SQLAlchemy)]
      B --> C[Controllers (Blueprints)]
      C -->|render| V[Templates (Jinja2)]
    end

    subgraph Frontend
      VM[model.js] --> VV[view.js] --> VC[controller.js]
      VC -->|events| VV
    end

    V -->|delivers HTML| VC
    VC -->|fetch/DOM| VM
```

> El diagrama muestra separación entre modelo de datos (servidor), controladores y vistas (templates), y la organización MVC del lado cliente.

---

## 3. Cambios realizados y dónde encontrarlos
- **Archivos nuevos/actualizados (ruta base `flask_mvc_login/`):**
  - `app/static/js/model.js` — lógica de datos del frontend y utilidades (formateo, lista de productos).
  - `app/static/js/view.js` — funciones DOM para renderizar cards de producto.
  - `app/static/js/controller.js` — orquesta eventos, validaciones de registro y popup de cookies.
  - `app/static/styles.css` — estilos heredados de la Práctica 2 centralizados.
  - `app/templates/base.html` — ahora incluye la referencia a `styles.css` y carga los tres scripts JS.
  - `README_MVC.md` — este documento.

- **Funcionalidad preservada:** formulario de login, validaciones de frontend, popup de términos/cookies, listado dinámico de productos con detalle y eliminación.

---

## 4. Decisiones arquitectónicas y justificación
1. **Separación backend MVC:** Mantener modelos (persistencia) en `models.py`, controladores en `controllers/` y vistas en `templates/` mejora la mantenibilidad y facilita testing.
2. **MVC en frontend:** Separar el JS en `model/view/controller` reduce acoplamiento entre manipulación DOM y lógica de negocio (p. ej. formato de precio y operaciones sobre la lista de productos).
3. **No usar frameworks adicionales:** Se preservó la simplicidad usando Vanilla JS para evidenciar la migración arquitectónica sin ocultar la lógica tras bibliotecas.
4. **Reutilización de plantillas:** Las plantillas extienden `base.html`; los scripts se cargan desde allí para evitar duplicación.

---

## 5. Evidencias de separación (extractos)
- `app/static/js/model.js` contiene la lista de productos y funciones `getProducts()` / `removeProductById()` — **modelo frontend**.
- `app/static/js/view.js` implementa `renderProductList(container, products)` — **vista frontend**.
- `app/static/js/controller.js` registra eventos del DOM (`DOMContentLoaded`) y enlaza operaciones — **controlador frontend**.

---

## 6. Cómo reproducir (local)
1. Crear y activar un entorno virtual, instalar dependencias:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
2. Copiar `.env.example` a `.env` y ajustar `ADMIN_EMAIL`/`ADMIN_PASSWORD` si se desea.
3. Inicializar la BD y seed demo:
```bash
flask --app wsgi.py init-db
```
4. Ejecutar en dev:
```bash
python run.py
# abrir http://127.0.0.1:5000
```

---

## 7. Dificultades y notas finales
- No se utilizaron frameworks frontend para mantener visibilidad del patrón MVC aplicado manualmente.  
- Si necesitas, puedo adaptar el frontend para que solicite los productos desde el backend (API REST) en lugar de usar la lista embebida en `model.js`.

---

**Fin del README (versión resumida adecuada para entrega).**