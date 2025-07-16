from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, name e password são obrigatórios'}), 400
        
        print(f"Tentativa de registro para email: {data['email']}")  # Debug
        
        # Verificar se usuário já existe
        if User.query.filter_by(email=data['email']).first():
            print(f"Email já existe: {data['email']}")  # Debug
            return jsonify({'error': 'Email já está em uso'}), 409
        
        print("Criando novo usuário")  # Debug
        
        # Criar novo usuário
        user = User(
            email=data['email'],
            name=data['name']
        )
        user.set_password(data['password'])
        
        print("Senha hash criada")  # Debug
        
        db.session.add(user)
        db.session.commit()
        
        print("Usuário salvo no banco")  # Debug
        
        # Criar token de acesso
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        
        print("Token gerado para novo usuário")  # Debug
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Erro no registro: {str(e)}")  # Debug
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar usuário: {str(e)}'}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e password são obrigatórios'}), 400
        
        print(f"Tentativa de login para email: {data['email']}")  # Debug
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            print(f"Usuário não encontrado para email: {data['email']}")  # Debug
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        print(f"Usuário encontrado: {user.email}")  # Debug
        
        if not user.check_password(data['password']):
            print("Senha incorreta")  # Debug
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        print("Senha correta, gerando token")  # Debug
        
        # Criar token de acesso
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        
        print("Token gerado com sucesso")  # Debug
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro no login: {str(e)}")  # Debug
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({'user': user.to_dict()}), 200