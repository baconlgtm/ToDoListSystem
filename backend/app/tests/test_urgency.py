from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ..main import app
from ..models import Todo
from ..database import Base, engine, get_db
import pytest

# Setup test database
def override_get_db():
    try:
        db = TestSession()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_todo_with_urgency():
    # Test creating todos with different urgency levels
    urgency_levels = [
        (0, "No urgency task"),
        (1, "Low urgency task"),
        (2, "Medium urgency task"),
        (3, "High urgency task")
    ]

    for urgency, title in urgency_levels:
        response = client.post(
            "/graphql",
            json={
                "query": """
                mutation($title: String!, $urgency: Int!) {
                    createTodo(input: {title: $title, urgency: $urgency}) {
                        id
                        title
                        urgency
                    }
                }
                """,
                "variables": {
                    "title": title,
                    "urgency": urgency
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data
        assert data["data"]["createTodo"]["urgency"] == urgency
        assert data["data"]["createTodo"]["title"] == title

def test_update_todo_urgency():
    # First create a todo
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation {
                createTodo(input: {title: "Test todo", urgency: 1}) {
                    id
                }
            }
            """
        }
    )
    
    todo_id = response.json()["data"]["createTodo"]["id"]
    
    # Test updating urgency
    response = client.post(
        "/graphql",
        json={
            "query": """
            mutation($id: Int!, $urgency: Int!) {
                updateTodo(id: $id, input: {urgency: $urgency}) {
                    id
                    urgency
                }
            }
            """,
            "variables": {
                "id": todo_id,
                "urgency": 3
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["updateTodo"]["urgency"] == 3

def test_invalid_urgency_values():
    # Test with invalid urgency values
    invalid_values = [-1, 4, 99]
    
    for invalid_value in invalid_values:
        response = client.post(
            "/graphql",
            json={
                "query": """
                mutation($urgency: Int!) {
                    createTodo(input: {title: "Test todo", urgency: $urgency}) {
                        urgency
                    }
                }
                """,
                "variables": {
                    "urgency": invalid_value
                }
            }
        )
        
        data = response.json()
        assert "errors" not in data
        # Should be clamped to valid range (0-3)
        assert 0 <= data["data"]["createTodo"]["urgency"] <= 3 