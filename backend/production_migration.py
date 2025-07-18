#!/usr/bin/env python3
"""
Production Migration Script
Run this on Render after deployment to update the database schema
"""

import os
import sys
from sqlalchemy import text

# Ensure we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_production_migration():
    try:
        from app import create_app
        from models import db, User, VerificationCode, Task
        
        app = create_app()
        
        with app.app_context():
            print("🔄 Starting production migration...")
            
            # Create all tables (this will add new columns to existing tables)
            db.create_all()
            print("✅ Tables created/updated")
            
            # Check if user_id column exists in task table
            try:
                result = db.session.execute(text("SELECT user_id FROM task LIMIT 1")).fetchone()
                print("✅ user_id column already exists in task table")
            except Exception:
                print("➕ Adding user_id column to task table...")
                try:
                    db.session.execute(text("ALTER TABLE task ADD COLUMN user_id INTEGER"))
                    db.session.commit()
                    print("✅ user_id column added")
                except Exception as e:
                    print(f"⚠️  Could not add user_id column (might already exist): {e}")
            
            # Check if email_verified column exists in user table
            try:
                result = db.session.execute(text("SELECT email_verified FROM \"user\" LIMIT 1")).fetchone()
                print("✅ email_verified column already exists in user table")
            except Exception:
                print("➕ Adding email_verified column to user table...")
                try:
                    db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN email_verified BOOLEAN DEFAULT TRUE"))
                    db.session.commit()
                    print("✅ email_verified column added")
                except Exception as e:
                    print(f"⚠️  Could not add email_verified column (might already exist): {e}")
            
            # Set existing users as verified (for backward compatibility)
            try:
                result = db.session.execute(text(
                    "UPDATE \"user\" SET email_verified = TRUE WHERE email_verified IS NULL"
                ))
                db.session.commit()
                print(f"✅ Updated {result.rowcount} existing users to verified status")
            except Exception as e:
                print(f"⚠️  Could not update existing users: {e}")
            
            # Assign existing tasks to first user if user_id is NULL
            try:
                # Get first user
                first_user = db.session.execute(text("SELECT id FROM \"user\" LIMIT 1")).fetchone()
                if first_user:
                    result = db.session.execute(text(
                        "UPDATE task SET user_id = :user_id WHERE user_id IS NULL"
                    ), {"user_id": first_user[0]})
                    db.session.commit()
                    if result.rowcount > 0:
                        print(f"✅ Assigned {result.rowcount} orphaned tasks to user {first_user[0]}")
                    else:
                        print("✅ No orphaned tasks found")
                else:
                    print("ℹ️  No users found - no task assignment needed")
            except Exception as e:
                print(f"⚠️  Could not assign orphaned tasks: {e}")
            
            print("🎉 Production migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_production_migration()