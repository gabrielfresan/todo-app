from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Email, name e password são obrigatórios'}), 400
    
    # Verificar se usuário já existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já está em uso'}), 409
    
    # Criar novo usuário
    user = User(
        email=data['email'],
        name=data['name']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Criar token de acesso
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=1)
        )
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao criar usuário'}), 500

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e password são obrigatórios'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Email ou senha inválidos'}), 401
    
    # Criar token de acesso
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        'message': 'Login realizado com sucesso',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({'user': user.to_dict()}), 200