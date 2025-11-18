
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user
from wtforms import Form, StringField, PasswordField, validators
from wtforms.validators import Email, DataRequired
from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

class LoginForm(Form):
    email = StringField("Email", [DataRequired(), Email()])
    password = PasswordField("Password", [DataRequired()])

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.menu"))
    form = LoginForm(request.form)
    if request.method == "POST" and form.validate():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash("¡Bienvenido!", "success")
            next_url = request.args.get("next") or url_for("main.menu")
            return redirect(next_url)
        flash("Credenciales inválidas", "danger")
    return render_template("login.html", form=form)

@auth_bp.route("/logout")
def logout():
    if current_user.is_authenticated:
        logout_user()
    flash("Has cerrado sesión.", "info")
    return redirect(url_for("auth.login"))
