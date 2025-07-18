"""
Migration to add email verification functionality
Run this after updating the models
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db, User, VerificationCode
from app import create_app

def run_migration():
    app = create_app()
    
    with app.app_context():
        try:
            # Create all tables (this will create new tables and add new columns)
            db.create_all()
            
            # Update existing users to have email_verified = True (existing users are considered verified)
            existing_users = User.query.all()
            for user in existing_users:
                if not hasattr(user, 'email_verified') or user.email_verified is None:
                    user.email_verified = True
            
            db.session.commit()
            print("Migration completed successfully!")
            print(f"Updated {len(existing_users)} existing users to verified status")
            
        except Exception as e:
            print(f"Migration error: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    run_migration()