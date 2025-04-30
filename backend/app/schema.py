import strawberry
from typing import List, Optional
from datetime import datetime, timezone
from . import models, crud, ai_service
from sqlalchemy.orm import Session
from .database import get_db
from strawberry.types import Info

@strawberry.type
class Todo:
    id: int
    title: str
    completed: bool
    urgency: Optional[int] = None  # 0 = none, 1 = low, 2 = medium, 3 = high
    createdAt: datetime
    updatedAt: datetime

    def __init__(self, id: int, title: str, completed: bool, urgency: Optional[int] = None, createdAt: datetime = None, updatedAt: datetime = None):
        self.id = id
        self.title = title
        self.completed = completed
        
        # Handle urgency value conversion and validation
        if urgency is not None:
            try:
                urgency_int = int(urgency)
                # Ensure urgency is between 0 and 3
                self.urgency = max(0, min(3, urgency_int))
            except (ValueError, TypeError):
                self.urgency = None
        else:
            self.urgency = None
            
        # Ensure timestamps are in UTC
        self.createdAt = createdAt.replace(tzinfo=timezone.utc) if createdAt and createdAt.tzinfo is None else createdAt
        self.updatedAt = updatedAt.replace(tzinfo=timezone.utc) if updatedAt and updatedAt.tzinfo is None else updatedAt

@strawberry.input
class TodoCreateInput:
    title: str
    urgency: Optional[int] = 1  # Default to low urgency (blue)

    def __init__(self, title: str, urgency: Optional[int] = 1):
        self.title = title
        # Ensure urgency is an integer between 0 and 3
        if urgency is not None:
            try:
                urgency_int = int(urgency)
                self.urgency = max(0, min(3, urgency_int))  # Clamp between 0 and 3
            except (ValueError, TypeError):
                self.urgency = 1  # Default to low if conversion fails
        else:
            self.urgency = 1  # Default to low if None

@strawberry.input
class TodoUpdateInput:
    title: Optional[str] = None
    completed: Optional[bool] = None
    urgency: Optional[int] = None

@strawberry.type
class Query:
    @strawberry.field
    async def todos(self, info) -> List[Todo]:
        db = info.context["db"]
        todos = crud.get_todos(db)
        return [Todo(
            id=todo.id,
            title=todo.title,
            completed=todo.completed,
            urgency=todo.urgency,
            createdAt=todo.created_at,
            updatedAt=todo.updated_at
        ) for todo in todos]

    @strawberry.field
    async def todo(self, info, id: int) -> Optional[Todo]:
        db = info.context["db"]
        todo = crud.get_todo(db, id)
        if todo:
            return Todo(
                id=todo.id,
                title=todo.title,
                completed=todo.completed,
                urgency=todo.urgency,
                createdAt=todo.created_at,
                updatedAt=todo.updated_at
            )
        return None

@strawberry.type
class TodoSuggestionResponse:
    suggestions: List[str]

@strawberry.type
class DeleteResponse:
    success: bool

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_todo(self, info, input: TodoCreateInput) -> Todo:
        db = info.context["db"]
        created_todo = crud.create_todo(db, input)
        return Todo(
            id=created_todo.id,
            title=created_todo.title,
            completed=created_todo.completed,
            urgency=created_todo.urgency,
            createdAt=created_todo.created_at,
            updatedAt=created_todo.updated_at
        )

    @strawberry.mutation
    async def generate_todo_suggestion(self, info, existing_todos: List[str], urgency: int) -> TodoSuggestionResponse:
        """Generate todo suggestions based on existing todos and urgency level."""
        suggestions = ai_service.generate_todo_suggestion(existing_todos, urgency)
        return TodoSuggestionResponse(suggestions=suggestions)

    @strawberry.mutation
    async def update_todo(self, info, id: int, input: TodoUpdateInput) -> Optional[Todo]:
        db = info.context["db"]
        updated_todo = crud.update_todo(db, id, input)
        if updated_todo:
            return Todo(
                id=updated_todo.id,
                title=updated_todo.title,
                completed=updated_todo.completed,
                urgency=updated_todo.urgency,
                createdAt=updated_todo.created_at,
                updatedAt=updated_todo.updated_at
            )
        return None

    @strawberry.mutation
    async def delete_todo(self, info, id: int) -> Optional[Todo]:
        db = info.context["db"]
        deleted_todo = crud.delete_todo(db, id)
        if deleted_todo:
            return Todo(
                id=deleted_todo.id,
                title=deleted_todo.title,
                completed=deleted_todo.completed,
                urgency=deleted_todo.urgency,
                createdAt=deleted_todo.created_at,
                updatedAt=deleted_todo.updated_at
            )
        return None

    @strawberry.mutation
    async def delete_all_todos(self, info: Info) -> DeleteResponse:
        """Delete all todos."""
        db = info.context["db"]
        deleted_count = crud.delete_all_todos(db)
        return DeleteResponse(success=deleted_count > 0)

    @strawberry.mutation
    async def delete_completed_todos(self, info: Info) -> DeleteResponse:
        """Delete all completed todos."""
        db = info.context["db"]
        deleted_count = crud.delete_completed_todos(db)
        return DeleteResponse(success=deleted_count > 0)

async def get_context():
    db = next(get_db())
    try:
        yield {"db": db}
    finally:
        db.close()

schema = strawberry.Schema(query=Query, mutation=Mutation) 