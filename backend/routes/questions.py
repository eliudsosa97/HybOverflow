from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Question, User
from models.answer import Answer

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('', methods=['GET'])  # Cambié de '/' a ''
def get_questions():
    """Obtener lista de preguntas con filtros opcionales"""
    try:
        # Parámetros de query
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        category_id = request.args.get('category_id', type=int)
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, votes, views
        order = request.args.get('order', 'desc')  # asc, desc
        
        # Validar parámetros
        per_page = min(per_page, 50)  # Máximo 50 por página
        if sort_by not in ['created_at', 'votes', 'views']:
            sort_by = 'created_at'
        if order not in ['asc', 'desc']:
            order = 'desc'
        
        # Construir query base
        query = Question.query.filter_by(is_active=True)
        
        # Filtros
        if search:
            query = query.filter(
                Question.title.contains(search) | 
                Question.content.contains(search)
            )
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        # Ordenamiento
        if order == 'desc':
            query = query.order_by(getattr(Question, sort_by).desc())
        else:
            query = query.order_by(getattr(Question, sort_by).asc())
        
        # Paginación
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        questions = [q.to_dict() for q in pagination.items]
        
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
        print(f"Error en get_questions: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@questions_bp.route('/<int:question_id>', methods=['GET'])
def get_question(question_id):
    """Obtener una pregunta específica con sus respuestas"""
    try:
        question = Question.query.get_or_404(question_id)
        
        if not question.is_active:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        # Incrementar contador de vistas
        question.views += 1
        db.session.commit()
        
        # Obtener respuestas ordenadas por votos
        answers = question.answers.filter_by(is_active=True).order_by(
            Answer.is_accepted.desc(),
            Answer.votes.desc(),
            Answer.created_at.asc()
        ).all()
        
        question_data = question.to_dict()
        question_data['answers'] = [answer.to_dict() for answer in answers]
        
        return jsonify(question_data), 200
        
    except Exception as e:
        print(f"Error en get_question: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@questions_bp.route('', methods=['POST'])  # Cambié de '/' a ''
@jwt_required()
def create_question():
    """Crear nueva pregunta"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        data = request.get_json()
        
        print(f"DEBUG: user_id={current_user_id}, data={data}")  # Debug
        
        # Validar datos requeridos
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Título y contenido son requeridos'}), 400
        
        if len(data['title']) < 10:
            return jsonify({'error': 'El título debe tener al menos 10 caracteres'}), 400
            
        if len(data['content']) < 20:
            return jsonify({'error': 'El contenido debe tener al menos 20 caracteres'}), 400
        
        # Crear pregunta
        question = Question(
            title=data['title'],
            content=data['content'],
            author_id=current_user_id,
            category_id=data.get('category_id')
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Pregunta creada exitosamente',
            'question': question.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Error en create_question: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@questions_bp.route('/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    """Actualizar pregunta (solo el autor)"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        question = Question.query.get_or_404(question_id)
        
        # Verificar que el usuario es el autor
        if question.author_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para editar esta pregunta'}), 403
        
        data = request.get_json()
        
        # Actualizar campos
        if 'title' in data:
            if len(data['title']) < 10:
                return jsonify({'error': 'El título debe tener al menos 10 caracteres'}), 400
            question.title = data['title']
        
        if 'content' in data:
            if len(data['content']) < 20:
                return jsonify({'error': 'El contenido debe tener al menos 20 caracteres'}), 400
            question.content = data['content']
        
        if 'category_id' in data:
            question.category_id = data['category_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pregunta actualizada exitosamente',
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error en update_question: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    """Eliminar pregunta (solo el autor)"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        question = Question.query.get_or_404(question_id)
        
        # Verificar que el usuario es el autor
        if question.author_id != current_user_id:
            return jsonify({'error': 'No tienes permisos para eliminar esta pregunta'}), 403
        
        # Soft delete
        question.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Pregunta eliminada exitosamente'}), 200
        
    except Exception as e:
        print(f"Error en delete_question: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500 