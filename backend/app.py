from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import api
from flask_migrate import Migrate

# Initialize migration
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS
    CORS(app, origins=["http://localhost:5173", "https://todo-app-drab-two.vercel.app"])
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
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