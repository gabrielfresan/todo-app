from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, timezone

# Definir o fuso horário UTC-3 (Brasil)
BRAZIL_TZ = timezone(timedelta(hours=-3))

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(BRAZIL_TZ))
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