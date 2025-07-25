from datetime import datetime
from . import db

class Answer(db.Model):
    """Modelo de Respuesta para StudentOverflow"""
    
    __tablename__ = 'answers'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    
    # Relaciones
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Métricas
    votes = db.Column(db.Integer, default=0)
    
    # Estado
    is_accepted = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Answer {self.id} for Question {self.question_id}>'
    
    def to_dict(self, include_author=True):
        """Convierte la respuesta a diccionario"""
        data = {
            'id': self.id,
            'content': self.content,
            'votes': self.votes,
            'is_accepted': self.is_accepted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'question_id': self.question_id
        }
        
        if include_author and self.author:
            data['author'] = {
                'id': self.author.id,
                'username': self.author.username,
                'reputation': self.author.reputation
            }
        
        return data 