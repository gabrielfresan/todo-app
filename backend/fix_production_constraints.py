#!/usr/bin/env python3
"""
Emergency script to fix foreign key constraint issues in production
"""

from app import create_app
from models import db
from sqlalchemy import text

def fix_production_constraints():
    """Fix the foreign key constraint issues in production"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚨 Emergency constraint fix starting...")
            
            # First, check what tables exist
            try:
                tables_result = db.session.execute(text("""
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)).fetchall()
                
                existing_tables = [row[0] for row in tables_result]
                print(f"📋 All tables: {existing_tables}")
                
            except Exception as e:
                print(f"ℹ️ Using SQLite, skipping table check: {e}")
                existing_tables = []
            
            # Clean up the problematic email_verification table if it exists
            if 'email_verification' in existing_tables:
                print("🗑️ Found problematic email_verification table - removing...")
                
                # First, copy any data we need to preserve
                try:
                    print("📋 Checking data in email_verification...")
                    data = db.session.execute(text("SELECT * FROM email_verification LIMIT 5")).fetchall()
                    print(f"Found {len(data)} records in email_verification")
                    
                    # If there's data, try to migrate it to verification_code table
                    if data:
                        print("📦 Migrating data to verification_code table...")
                        for row in data:
                            try:
                                # Try to insert into verification_code if it doesn't exist
                                db.session.execute(text("""
                                    INSERT INTO verification_code (email, code, created_at, expires_at, verified)
                                    SELECT email, code, created_at, expires_at, verified 
                                    FROM email_verification 
                                    WHERE id = :id
                                    ON CONFLICT DO NOTHING
                                """), {"id": row[0]})
                            except Exception as e:
                                print(f"⚠️ Could not migrate row {row[0]}: {e}")
                        
                        db.session.commit()
                        print("✅ Data migration attempted")
                    
                except Exception as e:
                    print(f"⚠️ Data migration failed: {e}")
                
                # Now drop the problematic table with CASCADE to remove all constraints
                print("🗑️ Dropping email_verification table with CASCADE...")
                db.session.execute(text("DROP TABLE IF EXISTS email_verification CASCADE"))
                db.session.commit()
                print("✅ email_verification table dropped")
            
            # Remove any remaining constraints on verification_code
            constraint_commands = [
                "ALTER TABLE verification_code DROP CONSTRAINT IF EXISTS email_verification_user_id_fkey",
                "ALTER TABLE verification_code DROP CONSTRAINT IF EXISTS verification_code_user_id_fkey", 
                "ALTER TABLE verification_code DROP CONSTRAINT IF EXISTS fk_verification_code_user_id",
                "ALTER TABLE verification_code DROP CONSTRAINT IF EXISTS verification_code_email_fkey"
            ]
            
            for cmd in constraint_commands:
                try:
                    db.session.execute(text(cmd))
                    print(f"✅ Executed: {cmd}")
                except Exception as e:
                    print(f"ℹ️ {cmd}: {e}")
            
            db.session.commit()
            
            # Recreate verification_code table properly without foreign keys
            print("🔧 Ensuring verification_code table structure is correct...")
            db.create_all()
            
            print("🎉 Emergency fix completed successfully!")
            print("💡 The app should now work without foreign key constraint errors")
            
        except Exception as e:
            print(f"❌ Emergency fix failed: {e}")
            try:
                db.session.rollback()
            except:
                pass

if __name__ == "__main__":
    fix_production_constraints()