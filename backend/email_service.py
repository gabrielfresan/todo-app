import resend
from flask import current_app
import os

class EmailService:
    def __init__(self):
        self.resend_api_key = current_app.config.get('RESEND_API_KEY')
        if self.resend_api_key:
            resend.api_key = self.resend_api_key
    
    def send_verification_email(self, to_email, verification_code):
        """Send verification code email using Resend"""
        try:
            if not self.resend_api_key:
                raise Exception("Resend API key not configured")
            
            from_email = current_app.config.get('FROM_EMAIL', 'noreply@yourdomain.com')
            
            # Email content
            subject = "Código de Verificação - Todo App"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">Todo App</h1>
                    <h2 style="color: #007bff; margin-bottom: 30px;">Código de Verificação</h2>
                    
                    <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                        Use o código abaixo para verificar sua conta:
                    </p>
                    
                    <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 30px 0;">
                        {verification_code}
                    </div>
                    
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">
                        Este código expira em 10 minutos.<br>
                        Se você não solicitou este código, ignore este email.
                    </p>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Todo App - Código de Verificação
            
            Use o código abaixo para verificar sua conta:
            
            {verification_code}
            
            Este código expira em 10 minutos.
            Se você não solicitou este código, ignore este email.
            """
            
            # Send email using Resend
            params = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content
            }
            
            response = resend.Emails.send(params)
            return True, response
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False, str(e)
    
    def send_password_reset_email(self, to_email, reset_token):
        """Send password reset email using Resend"""
        try:
            if not self.resend_api_key:
                raise Exception("Resend API key not configured")
            
            from_email = current_app.config.get('FROM_EMAIL', 'noreply@yourdomain.com')
            
            # Email content
            subject = "Redefinir Senha - Todo App"
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333; margin-bottom: 20px;">Todo App</h1>
                    <h2 style="color: #dc3545; margin-bottom: 30px;">Redefinir Senha</h2>
                    
                    <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                        Recebemos uma solicitação para redefinir sua senha. Use o token abaixo:
                    </p>
                    
                    <div style="background-color: #dc3545; color: white; font-size: 24px; font-weight: bold; padding: 15px; border-radius: 8px; word-break: break-all; margin: 30px 0;">
                        {reset_token}
                    </div>
                    
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">
                        Este token expira em 30 minutos.<br>
                        Se você não solicitou a redefinição de senha, ignore este email.
                    </p>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Todo App - Redefinir Senha
            
            Recebemos uma solicitação para redefinir sua senha. Use o token abaixo:
            
            {reset_token}
            
            Este token expira em 30 minutos.
            Se você não solicitou a redefinição de senha, ignore este email.
            """
            
            # Send email using Resend
            params = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content
            }
            
            response = resend.Emails.send(params)
            return True, response
            
        except Exception as e:
            print(f"Error sending password reset email: {str(e)}")
            return False, str(e)