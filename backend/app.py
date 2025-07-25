from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

def create_app():
    """Factory function para crear la aplicación Flask"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Inicializar extensiones
    from models import db
    db.init_app(app)
    
    jwt = JWTManager()
    jwt.init_app(app)
    
    # Configurar CORS específicamente para Next.js
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Registrar blueprints
    from routes.auth import auth_bp
    from routes.questions import questions_bp
    from routes.answers import answers_bp
    from routes.users import users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(questions_bp, url_prefix='/api/questions')
    app.register_blueprint(answers_bp, url_prefix='/api/answers')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    # Crear tablas
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def home():
        return {"message": "StudentOverflow API está funcionando!", "version": "1.0.0"}
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "service": "StudentOverflow Backend"}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001) 