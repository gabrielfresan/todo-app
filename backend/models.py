from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, timezone
import bcrypt

# Definir o fuso horário UTC-3 (Brasil)
BRAZIL_TZ = timezone(timedelta(hours=-3))

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(BRAZIL_TZ))
    
    # Relacionamento com tarefas
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        try:
            print(f"Verificando senha para usuário: {self.email}")
            print(f"Hash armazenado: {self.password_hash[:20]}...")
            result = bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
            print(f"Resultado da verificação: {result}")
            return result
        except Exception as e:
            print(f"Erro na verificação de senha: {str(e)}")
            return False
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat()
        }

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(BRAZIL_TZ))
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    verified = db.Column(db.Boolean, default=False)
    
    def __init__(self, email, code):
        self.email = email
        self.code = code
        self.created_at = datetime.now(BRAZIL_TZ)
        self.expires_at = self.created_at + timedelta(minutes=10)  # Expira em 10 minutos
    
    def is_expired(self):
        now = datetime.now(BRAZIL_TZ)
        # Convert expires_at to the same timezone if needed
        if self.expires_at.tzinfo is None:
            # If stored without timezone, assume it's in BRAZIL_TZ
            expires_at = self.expires_at.replace(tzinfo=BRAZIL_TZ)
        else:
            expires_at = self.expires_at.astimezone(BRAZIL_TZ)
        return now > expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'verified': self.verified
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(BRAZIL_TZ))
    # Relacionamento com usuário
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Campos para recorrência
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_type = db.Column(db.String(20), nullable=True)  # 'daily', 'weekly', 'monthly'
    parent_task_id = db.Column(db.Integer, nullable=True)  # Para rastrear relações entre tarefas recorrentes
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'is_recurring': self.is_recurring,
            'recurrence_type': self.recurrence_type,
            'parent_task_id': self.parent_task_id
        }