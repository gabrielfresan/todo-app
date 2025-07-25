from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, User, BRAZIL_TZ
from datetime import datetime, timezone, timedelta
import calendar

api = Blueprint('api', __name__)

@api.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = int(get_jwt_identity())
        print(f"Carregando tarefas para usuário: {current_user_id}")
        tasks = Task.query.filter_by(user_id=current_user_id).all()
        print(f"Encontradas {len(tasks)} tarefas")
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        print(f"Erro ao carregar tarefas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()
    return jsonify(task.to_dict())

@api.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
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
        completed=data.get('completed', False),
        is_recurring=data.get('is_recurring', False),
        recurrence_type=data.get('recurrence_type'),
        user_id=current_user_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@api.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()
    data = request.json
    
    old_completed_status = task.completed
    
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
    if 'is_recurring' in data:
        task.is_recurring = data['is_recurring']
    if 'recurrence_type' in data:
        task.recurrence_type = data['recurrence_type']
    
    # Se a tarefa for marcada como concluída e for recorrente, criar a próxima tarefa
    if task.completed and not old_completed_status and task.is_recurring and task.due_date:
        create_next_recurring_task(task)
    
    db.session.commit()
    
    return jsonify(task.to_dict())

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()
    
    db.session.delete(task)
    db.session.commit()
    
    return '', 204

@api.route('/tasks/completed', methods=['DELETE'])
@jwt_required()
def delete_completed_tasks():
    """Delete all completed tasks."""
    current_user_id = int(get_jwt_identity())
    # Find all completed tasks for the current user
    completed_tasks = Task.query.filter_by(completed=True, user_id=current_user_id).all()
    
    # Delete each task
    for task in completed_tasks:
        db.session.delete(task)
    
    # Commit changes
    db.session.commit()
    
    # Return success response with count of deleted tasks
    return jsonify({"deleted_count": len(completed_tasks)}), 200

def create_next_recurring_task(task):
    """
    Cria a próxima tarefa recorrente baseada no tipo de recorrência.
    """
    current_due_date = task.due_date
    next_due_date = None
    
    # Calcular próxima data de vencimento com base no tipo de recorrência
    if task.recurrence_type == 'daily':
        next_due_date = current_due_date + timedelta(days=1)
    
    elif task.recurrence_type == 'weekly':
        next_due_date = current_due_date + timedelta(weeks=1)
    
    elif task.recurrence_type == 'monthly':
        # Pegar dia do mês atual
        current_day = current_due_date.day
        current_month = current_due_date.month
        current_year = current_due_date.year
        
        # Calcular próximo mês
        if current_month == 12:
            next_month = 1
            next_year = current_year + 1
        else:
            next_month = current_month + 1
            next_year = current_year
        
        # Verificar o número de dias no próximo mês
        days_in_next_month = calendar.monthrange(next_year, next_month)[1]
        
        # Ajustar para o último dia do mês se o dia atual for maior
        if current_day > days_in_next_month:
            next_day = days_in_next_month
        else:
            next_day = current_day
        
        # Criar nova data com mesmo horário
        next_due_date = current_due_date.replace(
            year=next_year,
            month=next_month,
            day=next_day
        )
    
    if next_due_date:
        # Criar nova tarefa recorrente
        new_task = Task(
            title=task.title,
            description=task.description,
            due_date=next_due_date,
            completed=False,
            is_recurring=task.is_recurring,
            recurrence_type=task.recurrence_type,
            parent_task_id=task.id,
            user_id=task.user_id
        )
        db.session.add(new_task)