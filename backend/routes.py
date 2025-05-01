from flask import Blueprint, request, jsonify
from models import db, Task, BRAZIL_TZ
from datetime import datetime, timezone

api = Blueprint('api', __name__)

@api.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

@api.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@api.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    
    due_date = None
    if data.get('due_date'):
        # Converte a string ISO para datetime com timezone
        dt = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        # Convertemos para o fuso horário local (UTC-3)
        due_date = dt.astimezone(BRAZIL_TZ)
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date,
        completed=data.get('completed', False)
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@api.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'due_date' in data and data['due_date']:
        # Converte a string ISO para datetime com timezone
        dt = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        # Convertemos para o fuso horário local (UTC-3)
        task.due_date = dt.astimezone(BRAZIL_TZ)
    if 'completed' in data:
        task.completed = data['completed']
    
    db.session.commit()
    
    return jsonify(task.to_dict())

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    
    db.session.delete(task)
    db.session.commit()
    
    return '', 204
