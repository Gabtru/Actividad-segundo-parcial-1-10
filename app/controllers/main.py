# app/controllers/main.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, abort
from flask_login import login_required, current_user
# Importaciones de WTForms
from wtforms import Form, StringField, DecimalField, SelectField
from wtforms.validators import DataRequired, NumberRange
# Importaciones de Modelos
from ..models import Product, db, User

main_bp = Blueprint("main", __name__)

# ============================================================
# FORMULARIO DE PRODUCTOS
# ============================================================

class ProductForm(Form):
    """
    Formulario para validar productos tanto desde HTML (/nuevo)
    como desde la API (/api/productos).
    """
    name = StringField("Nombre", [DataRequired(message="El nombre es obligatorio.")])
    price = DecimalField(
        "Precio (€)",
        [
            DataRequired(message="El precio es obligatorio."),
            NumberRange(min=0.01, message="El precio debe ser positivo.")
        ],
        places=2
    )
    image_path = SelectField(
        "Imagen",
        choices=[
            ("products/p1.svg", "products/p1.svg"),
            ("products/p2.svg", "products/p2.svg"),
            ("products/p3.svg", "products/p3.svg"),
            ("products/p4.svg", "products/p4.svg")
        ],
        default="products/p1.svg"
    )

# ============================================================
# RUTAS PRINCIPALES
# ============================================================

@main_bp.route("/")
def index():
    if current_user.is_authenticated:
        return render_template("menu.html", user=current_user)
    return redirect(url_for("auth.login"))

@main_bp.route("/menu")
@login_required
def menu():
    return render_template("menu.html", user=current_user)

@main_bp.route("/usuario")
@login_required
def usuario():
    return render_template("usuario.html", user=current_user)

@main_bp.route("/preferencias", methods=["GET", "POST"])
@login_required
def preferencias():
    if request.method == "POST":
        new_email = request.form.get("email") or current_user.email
        new_password = request.form.get("password")

        if new_email and new_email != current_user.email:
            if User.query.filter(User.email == new_email, User.id != current_user.id).first():
                flash("Ese email ya está en uso.", "danger")
            else:
                current_user.email = new_email
                db.session.commit()
                flash("Email actualizado.", "success")

        if new_password:
            if len(new_password) < 6:
                flash("La contraseña debe tener al menos 6 caracteres.", "warning")
            else:
                current_user.set_password(new_password)
                db.session.commit()
                flash("Contraseña actualizada.", "success")

        return redirect(url_for("main.preferencias"))

    return render_template("preferencias.html", user=current_user)

@main_bp.route("/nuevo", methods=["GET", "POST"])
@login_required
def nuevo():
    """
    Ruta HTML para crear productos.
    """
    form = ProductForm(request.form)

    if request.method == "POST" and form.validate():
        p = Product()
        p.name = form.name.data
        p.price = form.price.data
        p.image_path = form.image_path.data

        db.session.add(p)
        db.session.commit()
        flash("Producto creado correctamente.", "success")
        return redirect(url_for("main.productos"))

    return render_template("nuevo.html", form=form)

@main_bp.route("/productos")
@login_required
def productos():
    return render_template("productos.html")

# ============================================================
# RUTAS AJAX / XHR
# ============================================================

@main_bp.route("/ajax-timeout")
@login_required
def ajax_timeout():
    """
    Template para ejercicio de timeout + abort XHR.
    """
    return render_template("ajax_timeout.html")

@main_bp.route("/descarga-xhr")
@login_required
def descarga_xhr():
    """
    Template para ejercicio de descarga con progreso.
    """
    return render_template("descarga_xhr.html")

# ------------------------------------------------------------
# 🔥 NUEVA RUTA PARA EJERCICIO 8.5
# ------------------------------------------------------------
@main_bp.route("/ejercicio8_5")
@login_required
def ejercicio_8_5():
    """
    Renderiza el ejercicio AJAX 8.5 (integración del template proporcionado).
    """
    return render_template("ejercicio8.5.html")

# ============================================================
# API ENDPOINTS
# ============================================================

@main_bp.route("/api/productos", methods=["GET"])
@login_required
def api_get_productos():
    items = Product.query.order_by(Product.name.asc()).all()
    lista_productos = [item.to_dict() for item in items]
    return jsonify(lista_productos)

@main_bp.route("/api/productos", methods=["POST"])
@login_required
def api_create_producto():
    form = ProductForm(request.form)

    if form.validate():
        p = Product()
        p.name = form.name.data
        p.price = form.price.data
        p.image_path = form.image_path.data

        db.session.add(p)
        db.session.commit()
        return jsonify(p.to_dict()), 201

    return jsonify({"errors": form.errors}), 400

@main_bp.route("/api/producto/<int:product_id>", methods=["DELETE"])
@login_required
def api_delete_producto(product_id):
    p = Product.query.get(product_id)
    if not p:
        abort(404)

    db.session.delete(p)
    db.session.commit()
    return jsonify({"success": True, "message": "Producto eliminado"})
