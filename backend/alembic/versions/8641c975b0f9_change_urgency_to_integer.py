"""change urgency to integer

Revision ID: 8641c975b0f9
Revises: aaaaad185e2e
Create Date: 2025-04-28 20:58:59.042449

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '8641c975b0f9'
down_revision = 'aaaaad185e2e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create a new table with the desired schema
    op.create_table(
        'todos_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('urgency', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Copy data from the old table to the new table
    op.execute('INSERT INTO todos_new (id, title, completed, urgency, created_at, updated_at) SELECT id, title, completed, CAST(CASE urgency WHEN "none" THEN 0 WHEN "low" THEN 1 WHEN "medium" THEN 2 WHEN "high" THEN 3 ELSE 0 END AS INTEGER), created_at, updated_at FROM todos')
    
    # Drop the old table
    op.drop_table('todos')
    
    # Rename the new table to the original name
    op.rename_table('todos_new', 'todos')


def downgrade() -> None:
    # Create a new table with the old schema
    op.create_table(
        'todos_old',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('urgency', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Copy data back with conversion
    op.execute('INSERT INTO todos_old (id, title, completed, urgency, created_at, updated_at) SELECT id, title, completed, CASE urgency WHEN 0 THEN "none" WHEN 1 THEN "low" WHEN 2 THEN "medium" WHEN 3 THEN "high" ELSE "none" END, created_at, updated_at FROM todos')
    
    # Drop the new table
    op.drop_table('todos')
    
    # Rename the old table back
    op.rename_table('todos_old', 'todos') 