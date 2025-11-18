from . import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
# ELIMINAMOS 'from flask import url_for' DE AQUÍ. ESA ERA LA CAUSA DEL ERROR.

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    image_path = db.Column(db.String(255), nullable=True)  # ruta relativa en /static

    def __repr__(self):
        return f"<Product {self.name} €{self.price:.2f}>"

    def to_dict(self):
        """
        Convierte el objeto Product a un diccionario 
        para enviarlo como JSON a la API.
        """
        # --- ESTA ES LA CORRECCIÓN ---
        # No usamos 'url_for'. Simplemente construimos la ruta estática
        # que el navegador ya entiende.
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "image_path": f"/static/{self.image_path}"
        }