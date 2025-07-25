from datetime import datetime
from . import db

class Category(db.Model):
    """Modelo de Categoría para StudentOverflow"""
    
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    color = db.Column(db.String(7), default='#007bff')  # Color hex
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    
    # Relaciones
    questions = db.relationship('Question', backref='category', lazy='dynamic')
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        """Convierte la categoría a diccionario"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'color': self.color,
            'question_count': self.questions.filter_by(is_active=True).count(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 