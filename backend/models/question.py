from datetime import datetime
from . import db

class Question(db.Model):
    """Modelo de Pregunta para StudentOverflow"""
    
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # Relaciones
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    
    # Métricas
    votes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    is_solved = db.Column(db.Boolean, default=False)
    
    # Relaciones
    answers = db.relationship('Answer', backref='question', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Question {self.title[:50]}...>'
    
    def to_dict(self, include_author=True):
        """Convierte la pregunta a diccionario"""
        data = {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'votes': self.votes,
            'views': self.views,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_solved': self.is_solved,
            'answer_count': self.answers.count(),
            'category_id': self.category_id
        }
        
        if include_author and self.author:
            data['author'] = {
                'id': self.author.id,
                'username': self.author.username,
                'reputation': self.author.reputation
            }
        
        return data 