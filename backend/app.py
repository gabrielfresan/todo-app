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
    
    # Create database tables and run migrations if they don't exist
    with app.app_context():
        print("Verificando/criando tabelas do banco de dados...")
        
        # Create all tables (including new ones)
        db.create_all()
        
        # Run production migrations automatically
        try:
            from sqlalchemy import text
            
            # Check and add user_id column to task table if needed
            try:
                db.session.execute(text("SELECT user_id FROM task LIMIT 1"))
                print("✅ user_id column exists")
            except:
                print("➕ Adding user_id column to task table...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN user_id INTEGER"))
                db.session.commit()
                print("✅ user_id column added")
            
            # Check and add email_verified column to user table if needed  
            try:
                db.session.execute(text("SELECT email_verified FROM \"user\" LIMIT 1"))
                print("✅ email_verified column exists")
            except:
                print("➕ Adding email_verified column to user table...")
                db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN email_verified BOOLEAN DEFAULT TRUE"))
                db.session.commit()
                print("✅ email_verified column added")
            
            # Set existing users as verified
            result = db.session.execute(text("UPDATE \"user\" SET email_verified = TRUE WHERE email_verified IS NULL"))
            if result.rowcount > 0:
                print(f"✅ Updated {result.rowcount} users to verified")
            
            # Assign orphaned tasks to first user
            first_user = db.session.execute(text("SELECT id FROM \"user\" LIMIT 1")).fetchone()
            if first_user:
                result = db.session.execute(text("UPDATE task SET user_id = :user_id WHERE user_id IS NULL"), {"user_id": first_user[0]})
                if result.rowcount > 0:
                    print(f"✅ Assigned {result.rowcount} tasks to user {first_user[0]}")
            
            db.session.commit()
            
        except Exception as e:
            print(f"⚠️ Migration warning: {e}")
            try:
                db.session.rollback()
            except:
                pass
        
        print("Tabelas prontas!")
    
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