#!/usr/bin/env python3
"""
Database cleanup script for foreign key constraint issues
"""

from app import create_app
from models import db, User, VerificationCode
from sqlalchemy import text

def cleanup_foreign_key_issues():
    """Clean up foreign key constraint issues in production"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔧 Starting database cleanup...")
            
            # Clean up orphaned verification codes first
            print("🧹 Cleaning up orphaned verification codes...")
            orphaned_codes = db.session.execute(text("""
                DELETE FROM verification_code 
                WHERE email NOT IN (SELECT email FROM "user")
            """))
            print(f"✅ Removed {orphaned_codes.rowcount} orphaned verification codes")
            
            # Clean up expired verification codes
            print("🧹 Cleaning up expired verification codes...")
            expired_codes = db.session.execute(text("""
                DELETE FROM verification_code 
                WHERE expires_at < NOW()
            """))
            print(f"✅ Removed {expired_codes.rowcount} expired verification codes")
            
            # Try to remove the foreign key constraint if it exists
            try:
                print("🔗 Attempting to remove foreign key constraint...")
                db.session.execute(text("""
                    ALTER TABLE verification_code 
                    DROP CONSTRAINT IF EXISTS email_verification_user_id_fkey
                """))
                print("✅ Foreign key constraint removed")
            except Exception as e:
                print(f"ℹ️  Foreign key constraint removal: {e}")
            
            # Also try alternative constraint names
            try:
                db.session.execute(text("""
                    ALTER TABLE verification_code 
                    DROP CONSTRAINT IF EXISTS verification_code_user_id_fkey
                """))
            except:
                pass
                
            try:
                db.session.execute(text("""
                    ALTER TABLE verification_code 
                    DROP CONSTRAINT IF EXISTS fk_verification_code_user
                """))
            except:
                pass
            
            db.session.commit()
            
            print("🎉 Database cleanup completed successfully!")
            
        except Exception as e:
            print(f"❌ Cleanup error: {e}")
            db.session.rollback()

if __name__ == "__main__":
    cleanup_foreign_key_issues()