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
def test_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()

def test_read_root(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Todo API"}

def test_create_todo(client, test_db):
    """Test creating a new todo"""
    response = client.post(
        "/api/todos/",
        json={"title": "Test Todo"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["completed"] is False
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_get_todos(client, test_db):
    """Test getting all todos"""
    # Create a test todo
    test_todo = models.Todo(title="Test Todo")
    test_db.add(test_todo)
    test_db.commit()
    test_db.refresh(test_todo)

    response = client.get("/api/todos/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(todo["title"] == "Test Todo" for todo in data)

def test_database_connection(test_db):
    """Test database connection"""
    result = test_db.execute("SELECT 1").scalar()
    assert result == 1 