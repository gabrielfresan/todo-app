from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Inicializar extensões
    db.init_app(app)
    CORS(app, origins=["http://localhost:5173", "https://todo-app-drab-two.vercel.app/"])
    
    # Registrar blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Criar as tabelas do banco de dados
    with app.app_context():
        db.create_all()
    
    @app.route('/')
    def hello():
        return 'API de Tarefas funcionando!'
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)