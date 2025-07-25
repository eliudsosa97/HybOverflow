from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .question import Question  
from .answer import Answer
from .category import Category

__all__ = ['db', 'User', 'Question', 'Answer', 'Category'] 