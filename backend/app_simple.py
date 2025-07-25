from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    """Version simplificada para testing"""
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/')
    def home():
        return {"message": "StudentOverflow API está funcionando!", "version": "1.0.0"}
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "service": "StudentOverflow Backend"}
    
    @app.route('/api/test')
    def test():
        return {"message": "Backend conectado correctamente con el frontend"}
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Backend simplificado iniciando...")
    app.run(debug=True, host='0.0.0.0', port=5000) 