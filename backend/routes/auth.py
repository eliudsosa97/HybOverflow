from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevo usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es requerido'}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Crear nuevo usuario
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            university=data.get('university', ''),
            major=data.get('major', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generar token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        print(f"Error en registro: {str(e)}")  # Para debugging
        db.session.rollback()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Inicio de sesión"""
    try:
        data = request.get_json()
        
        # Validar datos
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username y password son requeridos'}), 400
        
        # Buscar usuario (puede ser username o email)
        user = User.query.filter(
            (User.username == data['username']) | 
            (User.email == data['username'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Usuario desactivado'}), 401
        
        # Actualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generar token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict(include_private=True),
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Error en login: {str(e)}")  # Para debugging
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario actual"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        print(f"Error en get_profile: {str(e)}")  # Para debugging
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    """Verificar si el token es válido"""
    try:
        current_user_id = int(get_jwt_identity())  # Convertir de string a int
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Token inválido'}), 401
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error en verify_token: {str(e)}")  # Para debugging
        return jsonify({'error': 'Token inválido'}), 401 