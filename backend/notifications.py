from datetime import datetime, timezone, timedelta
from models import Task, BRAZIL_TZ

def get_due_tasks():
    """
    Get all tasks that are due but not completed.
    """
    now = datetime.now(BRAZIL_TZ)
    due_tasks = Task.query.filter(
        Task.due_date <= now,
        Task.completed == False
    ).all()
    
    return due_tasks