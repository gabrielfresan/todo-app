"""Add user_id column to tasks table

Revision ID: add_user_id
Revises: 
Create Date: 2025-07-16 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_id'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    # Add user_id column to task table
    op.add_column('task', sa.Column('user_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key('fk_task_user_id', 'task', 'user', ['user_id'], ['id'])
    
    # For existing tasks, we'll need to create a default user or leave them with null user_id
    # You can manually update existing tasks after migration


def downgrade():
    # Remove foreign key constraint
    op.drop_constraint('fk_task_user_id', 'task', type_='foreignkey')
    
    # Remove user_id column from task table
    op.drop_column('task', 'user_id')
    
    # Drop users table
    op.drop_table('user')