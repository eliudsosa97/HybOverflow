from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta

# Importar db desde el nivel superior para evitar importación circular
from . import db

class User(db.Model):
    """Modelo de Usuario"""
    __tablename__ = 'users'
    
    # Campos básicos
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    # Información personal
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(200))
    
    # Información académica
    university = db.Column(db.String(100))
    major = db.Column(db.String(100))
    
    # Sistema de reputación
    reputation = db.Column(db.Integer, default=0)
    
    # Metadatos
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relaciones
    questions = db.relationship('Question', backref='author', lazy=True, 
                               cascade='all, delete-orphan')
    answers = db.relationship('Answer', backref='author', lazy=True,
                             cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Hashear y guardar contraseña"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verificar contraseña"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self, expires_delta=None):
        """Generar JWT token"""
        if expires_delta is None:
            expires_delta = timedelta(days=7)
        
        # Convertir el ID a string para Flask-JWT-Extended
        return create_access_token(
            identity=str(self.id),  # Convertir a string
            expires_delta=expires_delta
        )
    
    def to_dict(self, include_private=False):
        """Convertir a diccionario para JSON"""
        data = {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'university': self.university,
            'major': self.major,
            'reputation': self.reputation,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_verified': self.is_verified
        }
        
        if include_private:
            data.update({
                'email': self.email,
                'last_login': self.last_login.isoformat() if self.last_login else None,
                'is_active': self.is_active
            })
        
        return data 