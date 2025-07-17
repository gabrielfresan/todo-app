from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api
from auth_routes import auth
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# Initialize migration
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)
    
    # Configure CORS
    CORS(app, origins=[
        "http://localhost:5173",
        "https://todo.fresan.tech",
        "https://todo-app-three-nu-14.vercel.app",
        "https://todo-app-git-main-gabrielfresans-projects.vercel.app",
        "https://todo-2shekykln-gabrielfresans-projects.vercel.app"
    ])
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(auth, url_prefix='/api/auth')
    
    # Create database tables
    with app.app_context():
        # Drop all tables and recreate (for development)
        print("Criando tabelas do banco de dados...")
        db.drop_all()
        db.create_all()
        print("Tabelas criadas com sucesso!")
    
    @app.route('/')
    def hello():
        return 'Task API is running!'
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)