from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app import models, crud
from app.database import Base, engine, get_db
import pytest

# Create test database
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

def test_create_todo(client, db):
    response = client.post(
        "/graphql",
        json={
            "query": """
                mutation {
                    createTodo(input: { title: "Test Todo" }) {
                        id
                        title
                        completed
                        createdAt
                        updatedAt
                    }
                }
            """
        }
    )
    assert response.status_code == 200
    data = response.json()["data"]["createTodo"]
    assert data["title"] == "Test Todo"
    assert data["completed"] is False
    assert "id" in data
    assert "createdAt" in data
    assert "updatedAt" in data

def test_get_todos(client, db):
    # Create a test todo
    test_todo = models.Todo(title="Test Todo")
    db.add(test_todo)
    db.commit()
    db.refresh(test_todo)

    response = client.post(
        "/graphql",
        json={
            "query": """
                query {
                    todos {
                        id
                        title
                        completed
                        createdAt
                        updatedAt
                    }
                }
            """
        }
    )
    assert response.status_code == 200
    data = response.json()["data"]["todos"]
    assert len(data) > 0
    assert any(todo["title"] == "Test Todo" for todo in data)

def test_update_todo(client, db):
    # Create a test todo
    test_todo = models.Todo(title="Test Todo")
    db.add(test_todo)
    db.commit()
    db.refresh(test_todo)

    response = client.post(
        "/graphql",
        json={
            "query": """
                mutation {
                    updateTodo(id: 1, input: { title: "Updated Todo", completed: true }) {
                        id
                        title
                        completed
                        createdAt
                        updatedAt
                    }
                }
            """
        }
    )
    assert response.status_code == 200
    data = response.json()["data"]["updateTodo"]
    assert data["title"] == "Updated Todo"
    assert data["completed"] is True

def test_delete_todo(client, db):
    # Create a test todo
    test_todo = models.Todo(title="Test Todo")
    db.add(test_todo)
    db.commit()
    db.refresh(test_todo)
    todo_id = test_todo.id

    response = client.post(
        "/graphql",
        json={
            "query": """
                mutation($id: Int!) {
                    deleteTodo(id: $id) {
                        id
                        title
                        completed
                        createdAt
                        updatedAt
                    }
                }
            """,
            "variables": {
                "id": todo_id
            }
        }
    )
    assert response.status_code == 200
    data = response.json()["data"]["deleteTodo"]
    assert data["title"] == "Test Todo"

    # Verify todo is deleted
    response = client.post(
        "/graphql",
        json={
            "query": """
                query($id: Int!) {
                    todo(id: $id) {
                        id
                    }
                }
            """,
            "variables": {
                "id": todo_id
            }
        }
    )
    assert response.status_code == 200
    assert response.json()["data"]["todo"] is None 