from datetime import datetime
import strawberry
from typing import Optional
from .. import models

@strawberry.type
class Todo:
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime]

    @classmethod
    def from_db_model(cls, db_todo: models.Todo) -> "Todo":
        return cls(
            id=db_todo.id,
            title=db_todo.title,
            description=db_todo.description or "",
            completed=db_todo.completed,
            created_at=db_todo.created_at,
            updated_at=db_todo.updated_at,
        )

@strawberry.input
class TodoInput:
    title: str
    description: Optional[str] = "" 