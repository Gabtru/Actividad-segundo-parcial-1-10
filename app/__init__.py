
import os
import click
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = "auth.login"

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    login_manager.init_app(app)

    from .models import User, Product  # noqa: F401
    from .controllers.auth import auth_bp
    from .controllers.main import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    # --- CLI Commands -------------------------------------------------------
    @app.cli.command("create-user")
    @click.argument("email")
    @click.argument("password")
    def create_user(email, password):
        """Crea un usuario: flask --app wsgi.py create-user email password"""
        from .models import User
        with app.app_context():
            if User.query.filter_by(email=email).first():
                click.echo("El usuario ya existe.")
                raise SystemExit(1)
            u = User(email=email)
            u.set_password(password)
            db.session.add(u)
            db.session.commit()
            click.echo(f"Usuario creado: {email}")

    @app.cli.command("init-db")
    def init_db():
        """Reinicia la base de datos y crea datos de ejemplo (¡destructivo!)."""
        from .models import User, Product
        with app.app_context():
            db.drop_all()
            db.create_all()
            # Usuario admin
            admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
            u = User(email=admin_email)
            u.set_password(admin_password)
            db.session.add(u)
            # Productos demo
            demo_products = [
                {"name": "Cuaderno A5", "price": 3.50, "image_path": "products/p1.svg"},
                {"name": "Bolígrafo Azul", "price": 1.20, "image_path": "products/p2.svg"},
                {"name": "Taza Cerámica", "price": 7.99, "image_path": "products/p3.svg"},
                {"name": "Mochila Urbana", "price": 24.90, "image_path": "products/p4.svg"},
            ]
            for p in demo_products:
                db.session.add(Product(**p))
            db.session.commit()
            click.echo("Base de datos inicializada con datos de ejemplo.")

    # --- DB bootstrap on first run -----------------------------------------
    with app.app_context():
        db.create_all()
        from .models import User, Product
        # Seed admin user if missing
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        if not User.query.filter_by(email=admin_email).first():
            u = User(email=admin_email)
            u.set_password(admin_password)
            db.session.add(u)
            db.session.commit()
        # Seed products if empty
        if Product.query.count() == 0:
            demo_products = [
                {"name": "Cuaderno A5", "price": 3.50, "image_path": "products/p1.svg"},
                {"name": "Bolígrafo Azul", "price": 1.20, "image_path": "products/p2.svg"},
                {"name": "Taza Cerámica", "price": 7.99, "image_path": "products/p3.svg"},
                {"name": "Mochila Urbana", "price": 24.90, "image_path": "products/p4.svg"},
            ]
            for p in demo_products:
                db.session.add(Product(**p))
            db.session.commit()

    return app
