# app/controllers/main.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, abort
from flask_login import login_required, current_user
# Importaciones de WTForms
from wtforms import Form, StringField, DecimalField, SelectField
from wtforms.validators import DataRequired, NumberRange
# Importaciones de Modelos
from ..models import Product, db, User

main_bp = Blueprint("main", __name__)

# Formulario WTForms para validar productos
class ProductForm(Form):
    """
    Este formulario valida los datos tanto para la ruta HTML (/nuevo)
    como para la ruta API (/api/productos POST).
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
    Ruta para crear un nuevo producto usando ProductForm.
    """
    form = ProductForm(request.form)

    if request.method == "POST" and form.validate():
        p = Product()
        p.name = form.name.data
        p.price = form.price.data
        p.image_path = form.image_path.data

        db.session.add(p)
        db.session.commit()
        flash("Producto creado (vía HTML).", "success")
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
    Muestra el template del ejercicio AJAX con timeout y abort.
    """
    return render_template("ajax_timeout.html")

@main_bp.route("/descarga-xhr")
@login_required
def descarga_xhr():
    """
    Muestra el template del ejercicio de descarga con progreso XHR.
    """
    return render_template("descarga_xhr.html")

# ============================================================
# API ENDPOINTS
# ============================================================

@main_bp.route("/api/productos", methods=["GET"])
@login_required
def api_get_productos():
    """
    Devuelve todos los productos.
    """
    items = Product.query.order_by(Product.name.asc()).all()
    lista_productos = [item.to_dict() for item in items]
    return jsonify(lista_productos)

@main_bp.route("/api/productos", methods=["POST"])
@login_required
def api_create_producto():
    """
    Crea un producto (para AJAX).
    """
    form = ProductForm(request.form)

    if form.validate():
        p = Product()
        p.name = form.name.data
        p.price = form.price.data
        p.image_path = form.image_path.data

        db.session.add(p)
        db.session.commit()
        return jsonify(p.to_dict()), 201
    else:
        return jsonify({"errors": form.errors}), 400

@main_bp.route("/api/producto/<int:product_id>", methods=["DELETE"])
@login_required
def api_delete_producto(product_id):
    """
    Borra un producto.
    """
    p = Product.query.get(product_id)
    if not p:
        abort(404)

    db.session.delete(p)
    db.session.commit()
    return jsonify({"success": True, "message": "Producto eliminado"})
