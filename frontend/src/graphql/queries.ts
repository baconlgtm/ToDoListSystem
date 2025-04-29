import { gql } from '@apollo/client';

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
      urgency
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TODO = gql`
  mutation CreateTodo($title: String!, $urgency: Int!) {
    createTodo(input: { title: $title, urgency: $urgency }) {
      id
      title
      completed
      urgency
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo($id: Int!, $title: String, $completed: Boolean, $urgency: Int) {
    updateTodo(id: $id, input: { title: $title, completed: $completed, urgency: $urgency }) {
      id
      title
      completed
      urgency
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      id
      title
      completed
      urgency
      createdAt
      updatedAt
    }
  }
`;

export const GENERATE_TODO_SUGGESTION = gql`
  mutation GenerateTodoSuggestion($existingTodos: [String!]!, $urgency: Int!) {
    generateTodoSuggestion(existingTodos: $existingTodos, urgency: $urgency) {
      suggestions
    }
  }
`;

export const DELETE_ALL_TODOS = gql`
  mutation DeleteAllTodos {
    deleteAllTodos
  }
`;

export const DELETE_COMPLETED_TODOS = gql`
  mutation DeleteCompletedTodos {
    deleteCompletedTodos
  }
`;
