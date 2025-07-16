#!/usr/bin/env python3
"""
Script para executar migrações do banco de dados
"""
import os
from flask import Flask
from flask_migrate import Migrate, init, migrate, upgrade
from models import db
from config import Config

def create_migration_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate = Migrate(app, db)
    
    return app, migrate

def run_migrations():
    app, _ = create_migration_app()
    
    with app.app_context():
        # Criar diretório de migrações se não existir
        if not os.path.exists('migrations'):
            print("Inicializando migrações...")
            init()
        
        # Criar migração
        print("Criando migração...")
        migrate(message='Add user_id to tasks and create users table')
        
        # Aplicar migração
        print("Aplicando migrações...")
        upgrade()
        
        print("Migrações concluídas!")

if __name__ == '__main__':
    run_migrations()