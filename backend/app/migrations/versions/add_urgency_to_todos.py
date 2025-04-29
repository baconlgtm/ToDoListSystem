"""add urgency to todos

Revision ID: add_urgency_to_todos
Revises: 
Create Date: 2024-04-29 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_urgency_to_todos'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('todos', sa.Column('urgency', sa.String(), nullable=True, server_default='none'))

def downgrade():
    op.drop_column('todos', 'urgency') 