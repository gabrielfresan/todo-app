from datetime import datetime
from models import Task

def get_due_tasks():
    """
    Obter todas as tarefas que estão vencidas mas não completadas.
    """
    now = datetime.utcnow()
    due_tasks = Task.query.filter(
        Task.due_date <= now,
        Task.completed == False
    ).all()
    
    return due_tasks