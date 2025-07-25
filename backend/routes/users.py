from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from models.question import Question
from models.answer import Answer

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        # Campos actualizables
        if 'first_name' in data:
            if not data['first_name'].strip():
                return jsonify({'error': 'El nombre no puede estar vacío'}), 400
            user.first_name = data['first_name'].strip()
        
        if 'last_name' in data:
            if not data['last_name'].strip():
                return jsonify({'error': 'El apellido no puede estar vacío'}), 400
            user.last_name = data['last_name'].strip()
        
        if 'bio' in data:
            user.bio = data['bio']
        
        if 'university' in data:
            user.university = data['university']
        
        if 'major' in data:
            user.major = data['major']
        
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Perfil actualizado exitosamente',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Obtener perfil público de un usuario"""
    try:
        user = User.query.get_or_404(user_id)
        
        if not user.is_active:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/<int:user_id>/questions', methods=['GET'])
def get_user_questions(user_id):
    """Obtener preguntas de un usuario"""
    try:
        user = User.query.get_or_404(user_id)
        
        if not user.is_active:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 20)  # Máximo 20 por página
        
        pagination = user.questions.filter_by(is_active=True).order_by(
            Question.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        questions = [q.to_dict(include_author=False) for q in pagination.items]
        
        return jsonify({
            'questions': questions,
            'pagination': {
                'page': page,
                'pages': pagination.pages,
                'per_page': per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@users_bp.route('/<int:user_id>/answers', methods=['GET'])
def get_user_answers(user_id):
    """Obtener respuestas de un usuario"""
    try:
        user = User.query.get_or_404(user_id)
        
        if not user.is_active:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 20)  # Máximo 20 por página
        
        pagination = user.answers.filter_by(is_active=True).order_by(
            Answer.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        answers = [a.to_dict(include_author=False) for a in pagination.items]
        
        return jsonify({
            'answers': answers,
            'pagination': {
                'page': page,
                'pages': pagination.pages,
                'per_page': per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500 