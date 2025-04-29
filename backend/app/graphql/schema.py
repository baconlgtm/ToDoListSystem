from typing import List
import strawberry
from sqlalchemy.orm import Session
from .types import Todo, TodoInput
from .. import crud
from ..database import get_db

@strawberry.type
class Query:
    @strawberry.field
    def todos(self, info) -> List[Todo]:
        db: Session = next(get_db())
        db_todos = crud.get_todos(db)
        return [Todo.from_db_model(todo) for todo in db_todos]

    @strawberry.field
    def todo(self, info, id: int) -> Todo:
        db: Session = next(get_db())
        db_todo = crud.get_todo(db, todo_id=id)
        if not db_todo:
            raise ValueError(f"Todo with id {id} not found")
        return Todo.from_db_model(db_todo)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_todo(self, info, todo_input: TodoInput) -> Todo:
        db: Session = next(get_db())
        db_todo = crud.create_todo(
            db=db,
            title=todo_input.title,
            description=todo_input.description
        )
        return Todo.from_db_model(db_todo)

    @strawberry.mutation
    def update_todo(self, info, id: int, completed: bool) -> Todo:
        db: Session = next(get_db())
        db_todo = crud.update_todo(db, todo_id=id, completed=completed)
        if not db_todo:
            raise ValueError(f"Todo with id {id} not found")
        return Todo.from_db_model(db_todo)

    @strawberry.mutation
    def delete_todo(self, info, id: int) -> Todo:
        db: Session = next(get_db())
        db_todo = crud.delete_todo(db, todo_id=id)
        if not db_todo:
            raise ValueError(f"Todo with id {id} not found")
        return Todo.from_db_model(db_todo)

schema = strawberry.Schema(query=Query, mutation=Mutation) 