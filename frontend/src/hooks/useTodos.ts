import { useMutation, useQuery } from '@apollo/client';
import { GET_TODOS, CREATE_TODO, UPDATE_TODO, DELETE_TODO } from '../graphql/queries';
import { TodoFormData } from '../types/todo';

export function useTodos() {
  const { data, loading, error } = useQuery(GET_TODOS);

  const [createTodoMutation] = useMutation(CREATE_TODO);
  const [updateTodoMutation] = useMutation(UPDATE_TODO);
  const [deleteTodoMutation] = useMutation(DELETE_TODO);

  const createTodo = async (formData: TodoFormData) => {
    await createTodoMutation({
      variables: {
        title: formData.title,
        urgency: formData.urgency
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
  };

  const updateTodo = async (id: number, completed: boolean) => {
    await updateTodoMutation({
      variables: { id, completed },
      refetchQueries: [{ query: GET_TODOS }],
    });
  };

  const deleteTodo = async (id: number) => {
    await deleteTodoMutation({
      variables: { id },
      refetchQueries: [{ query: GET_TODOS }],
    });
  };

  return {
    todos: data?.todos || [],
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
  };
} 