from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Answer, Question

answers_bp = Blueprint('answers', __name__)

@answers_bp.route('', methods=['POST'])  # Cambié de '/' a ''
@jwt_required()
def create_answer():
    """Crear nueva respuesta"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        data = request.get_json()
        
        print(f"DEBUG answers: user_id={current_user_id}, data={data}")  # Debug
        
        # Validar datos requeridos
        if not data.get('content') or not data.get('question_id'):
            return jsonify({'error': 'Contenido y ID de pregunta son requeridos'}), 400
        
        if len(data['content']) < 20:
            return jsonify({'error': 'La respuesta debe tener al menos 20 caracteres'}), 400
        
        # Verificar que la pregunta existe
        question = Question.query.get(data['question_id'])
        if not question or not question.is_active:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        # Crear respuesta
        answer = Answer(
            content=data['content'],
            question_id=data['question_id'],
            author_id=current_user_id
        )
        
        db.session.add(answer)
        db.session.commit()
        
        return jsonify({
            'message': 'Respuesta creada exitosamente',
            'answer': answer.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Error en create_answer: {str(e)}")  # Para debugging
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@answers_bp.route('/<int:answer_id>', methods=['PUT'])
@jwt_required()
def update_answer(answer_id):
    """Actualizar respuesta (solo el autor)"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        answer = Answer.query.get_or_404(answer_id)
        
        # Verificar que el usuario es el autor
        if answer.author_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para editar esta respuesta'}), 403
        
        data = request.get_json()
        
        # Actualizar contenido
        if 'content' in data:
            if len(data['content']) < 20:
                return jsonify({'error': 'La respuesta debe tener al menos 20 caracteres'}), 400
            answer.content = data['content']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Respuesta actualizada exitosamente',
            'answer': answer.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error en update_answer: {str(e)}")  # Para debugging
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@answers_bp.route('/<int:answer_id>', methods=['DELETE'])
@jwt_required()
def delete_answer(answer_id):
    """Eliminar respuesta (solo el autor)"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        answer = Answer.query.get_or_404(answer_id)
        
        # Verificar que el usuario es el autor
        if answer.author_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para eliminar esta respuesta'}), 403
        
        # Soft delete
        answer.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Respuesta eliminada exitosamente'}), 200
        
    except Exception as e:
        print(f"Error en delete_answer: {str(e)}")  # Para debugging
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@answers_bp.route('/<int:answer_id>/accept', methods=['POST'])
@jwt_required()
def accept_answer(answer_id):
    """Marcar respuesta como aceptada (solo el autor de la pregunta)"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        answer = Answer.query.get_or_404(answer_id)
        question = answer.question
        
        # Verificar que el usuario es el autor de la pregunta
        if question.author_id != current_user_id:
            return jsonify({'error': 'Solo el autor de la pregunta puede aceptar respuestas'}), 403
        
        # Desmarcar otras respuestas aceptadas para esta pregunta
        Answer.query.filter_by(question_id=answer.question_id).update({'is_accepted': False})
        
        # Marcar esta respuesta como aceptada
        answer.is_accepted = True
        question.is_solved = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Respuesta marcada como aceptada',
            'answer': answer.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error en accept_answer: {str(e)}")  # Para debugging
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500 