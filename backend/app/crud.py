from sqlalchemy.orm import Session
from . import models
from .schema import TodoCreateInput, TodoUpdateInput
from . import ai_service

def get_todo(db: Session, todo_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

def get_todos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Todo).offset(skip).limit(limit).all()

def create_todo(db: Session, todo_input: TodoCreateInput):
    db_todo = models.Todo(
        title=todo_input.title,
        urgency=todo_input.urgency
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, todo_id: int, todo_input: TodoUpdateInput):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        if todo_input.title is not None:
            db_todo.title = todo_input.title
        if todo_input.completed is not None:
            db_todo.completed = todo_input.completed
        if todo_input.urgency is not None:
            db_todo.urgency = todo_input.urgency
        db.commit()
        db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, todo_id: int):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)
        db.commit()
    return db_todo

def generate_todo(db: Session) -> models.Todo:
    # Get all existing todos
    todos = get_todos(db)
    if not todos:
        return create_todo(db, TodoCreateInput(title="Start your first task!"))
    
    # Get all todo titles
    todo_titles = [todo.title for todo in todos]
    
    # Generate new todo using AI
    new_title = ai_service.generate_todo_suggestion(todo_titles)
    
    # Create and return the new todo
    return create_todo(db, TodoCreateInput(title=new_title))

def delete_all_todos(db: Session):
    """Delete all todos from the database."""
    deleted_count = db.query(models.Todo).delete()
    db.commit()
    return deleted_count

def delete_completed_todos(db: Session):
    """Delete all completed todos from the database."""
    deleted_count = db.query(models.Todo).filter(models.Todo.completed == True).delete()
    db.commit()
    return deleted_count 