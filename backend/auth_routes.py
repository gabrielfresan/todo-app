from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, VerificationCode
from datetime import timedelta, datetime
from email_service import EmailService
import random
import string
import re
import threading
import time

auth = Blueprint('auth', __name__)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

def cleanup_unverified_user(email, delay=60):
    """Delete unverified user after specified delay (in seconds)"""
    from flask import current_app
    
    def delete_user():
        time.sleep(delay)
        try:
            # Create new app context for the thread
            with current_app.app_context():
                user = User.query.filter_by(email=email, email_verified=False).first()
                if user:
                    print(f"Removendo usuário não verificado: {email}")
                    # Clean up verification codes FIRST
                    codes = VerificationCode.query.filter_by(email=email).all()
                    for code in codes:
                        db.session.delete(code)
                    # Then delete user
                    db.session.delete(user)
                    db.session.commit()
                else:
                    print(f"Usuário {email} já foi verificado ou removido")
        except Exception as e:
            print(f"Erro ao limpar usuário não verificado: {str(e)}")
            try:
                db.session.rollback()
            except:
                pass
    
    thread = threading.Thread(target=delete_user)
    thread.daemon = True
    thread.start()

@auth.route('/register', methods=['POST'])
def register():
    """Step 1: Create user and send verification email"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, name e password são obrigatórios'}), 400
        
        email = data['email'].lower().strip()
        name = data['name'].strip()
        password = data['password']
        
        # Validate email format
        if not is_valid_email(email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        print(f"Tentativa de registro para email: {email}")
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            if existing_user.email_verified:
                return jsonify({'error': 'Email já está em uso'}), 409
            else:
                # Clean up old verification codes FIRST (before deleting user)
                old_codes = VerificationCode.query.filter_by(email=email).all()
                for code in old_codes:
                    db.session.delete(code)
                # Now remove unverified user
                db.session.delete(existing_user)
                db.session.commit()
        
        # Create new user (unverified)
        user = User(
            email=email,
            name=name,
            email_verified=False
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        print(f"Usuário criado (não verificado): {email}")
        
        # Generate and store verification code
        verification_code = generate_verification_code()
        code_record = VerificationCode(email=email, code=verification_code)
        db.session.add(code_record)
        db.session.commit()
        
        # Send verification email
        email_service = EmailService()
        success, response = email_service.send_verification_email(email, verification_code)
        
        if not success:
            # If email fails, clean up (codes first, then user)
            db.session.delete(code_record)
            db.session.delete(user)
            db.session.commit()
            return jsonify({'error': f'Erro ao enviar email de verificação: {response}'}), 500
        
        # Start cleanup timer (1 minute)
        cleanup_unverified_user(email, delay=60)
        
        return jsonify({
            'message': 'Usuário criado. Verifique seu email para confirmar o cadastro.',
            'email': email,
            'verification_sent': True
        }), 201
        
    except Exception as e:
        print(f"Erro no registro: {str(e)}")
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
            print(f"Usuário não encontrado para email: {data['email']}")
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        if not user.email_verified:
            return jsonify({'error': 'Email não verificado. Verifique seu email antes de fazer login.'}), 401
        
        print(f"Usuário encontrado: {user.email}")
        
        if not user.check_password(data['password']):
            print("Senha incorreta")
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

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

@auth.route('/verify-email', methods=['POST'])
def verify_email():
    """Step 2: Verify email with code and complete registration"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('code'):
            return jsonify({'error': 'Email e código são obrigatórios'}), 400
        
        email = data['email'].lower().strip()
        code = data['code'].strip()
        
        print(f"Verificando código para email: {email}")
        
        # Find the user
        user = User.query.filter_by(email=email, email_verified=False).first()
        if not user:
            return jsonify({'error': 'Usuário não encontrado ou já verificado'}), 404
        
        # Find the verification code
        code_record = VerificationCode.query.filter_by(
            email=email, 
            code=code, 
            verified=False
        ).first()
        
        if not code_record:
            return jsonify({'error': 'Código inválido ou expirado'}), 400
        
        if code_record.is_expired():
            return jsonify({'error': 'Código expirado'}), 400
        
        # Mark as verified
        user.email_verified = True
        code_record.verified = True
        
        db.session.commit()
        
        print(f"Email verificado com sucesso: {email}")
        
        # Create access token
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        
        return jsonify({
            'message': 'Email verificado com sucesso! Cadastro completo.',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Erro na verificação: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification code"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({'error': 'Email é obrigatório'}), 400
        
        email = data['email'].lower().strip()
        
        # Check if user exists and is unverified
        user = User.query.filter_by(email=email, email_verified=False).first()
        if not user:
            return jsonify({'error': 'Usuário não encontrado ou já verificado'}), 404
        
        # Clean up old codes
        old_codes = VerificationCode.query.filter_by(email=email).all()
        for code in old_codes:
            db.session.delete(code)
        
        # Generate new code
        verification_code = generate_verification_code()
        code_record = VerificationCode(email=email, code=verification_code)
        db.session.add(code_record)
        db.session.commit()
        
        # Send email
        email_service = EmailService()
        success, response = email_service.send_verification_email(email, verification_code)
        
        if success:
            return jsonify({
                'message': 'Novo código de verificação enviado'
            }), 200
        else:
            return jsonify({'error': f'Erro ao enviar email: {response}'}), 500
            
    except Exception as e:
        print(f"Erro ao reenviar verificação: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500