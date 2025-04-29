/**
 * TodoListContainer Component
 * 
 * Main container component that manages the todo list application state and data flow.
 * Handles GraphQL queries and mutations, sorting, and suggestion generation.
 * 
 * Features:
 * - Todo CRUD operations
 * - Sorting by timestamp and urgency
 * - Suggestion generation
 * - Bulk delete functionality
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import TodoSection from './TodoSection';
import { SuggestionPanel } from './SuggestionPanel';
import { GET_TODOS, CREATE_TODO, UPDATE_TODO, DELETE_TODO, GENERATE_TODO_SUGGESTION, DELETE_ALL_TODOS, DELETE_COMPLETED_TODOS } from '../graphql/queries';
import { Button } from './ui/button';
import { Todo } from '../types/todo';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { SortDropdown } from "./SortDropdown";
import { SortOption } from './SortDropdown';

export default function TodoListContainer() {
  // GraphQL queries and mutations
  const { loading, error, data } = useQuery(GET_TODOS);
  const [createTodo] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [updateTodo] = useMutation(UPDATE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [deleteAllTodos] = useMutation(DELETE_ALL_TODOS, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [deleteCompletedTodos] = useMutation(DELETE_COMPLETED_TODOS, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [generateSuggestion] = useMutation(GENERATE_TODO_SUGGESTION);
  
  // State management for suggestions panel
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [baseTodo, setBaseTodo] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  // State for delete all confirmation dialog
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDeleteCompletedDialog, setShowDeleteCompletedDialog] = useState(false);

  // State for sorting
  const [sortOption, setSortOption] = useState<SortOption>('timestamp');

  /**
   * Generate multiple suggestions for a todo item
   * @param title - The todo title to base suggestions on
   * @param urgency - The urgency level of the todo
   */
  const generateMultipleSuggestions = async (title: string, urgency: number) => {
    try {
      setIsGeneratingSuggestions(true);
      const { data } = await generateSuggestion({
        variables: {
          existingTodos: [title],
          urgency: urgency || 1
        }
      });
      
      // Always show the panel, even if there are no suggestions
      setCurrentSuggestions(data?.generateTodoSuggestion?.suggestions || []);
      setBaseTodo(title);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Show empty suggestions panel with error state
      setCurrentSuggestions([]);
      setBaseTodo(title);
      setShowSuggestions(true);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  /**
   * Apply selected suggestions as new todos
   * @param selectedSuggestions - Array of selected suggestions with their urgency levels
   */
  const handleApplySuggestions = async (selectedSuggestions: { title: string; urgency: number }[]) => {
    try {
      const promises = selectedSuggestions.map(suggestion => 
        createTodo({ 
          variables: { 
            title: suggestion.title,
            urgency: suggestion.urgency
          } 
        })
      );
      await Promise.all(promises);
      setShowSuggestions(false);
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  /**
   * Create a new todo item
   * @param title - The title of the todo
   * @param urgency - The urgency level of the todo
   */
  const handleCreateTodo = async (title: string, urgency: number) => {
    try {
      await createTodo({
        variables: { title, urgency },
        refetchQueries: [{ query: GET_TODOS }],
      });
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  /**
   * Update an existing todo item
   * @param id - The ID of the todo to update
   * @param completed - The new completion status
   * @param urgency - The new urgency level (optional)
   */
  const handleUpdateTodo = async (id: number, completed: boolean, urgency?: number) => {
    try {
      await updateTodo({
        variables: { 
          id, 
          completed, 
          urgency: urgency !== undefined ? Number(urgency) : undefined 
        },
        refetchQueries: [{ query: GET_TODOS }],
      });
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  /**
   * Delete a todo item
   * @param id - The ID of the todo to delete
   */
  const handleDelete = async (id: number) => {
    try {
      await deleteTodo({
        variables: { id },
      });
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  /**
   * Delete all todo items
   */
  const handleDeleteAll = async () => {
    try {
      await deleteAllTodos();
      setShowDeleteAllDialog(false);
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  /**
   * Delete all completed todo items
   */
  const handleDeleteCompleted = async () => {
    try {
      await deleteCompletedTodos();
      setShowDeleteCompletedDialog(false);
    } catch (error) {
      // Error handling is managed by Apollo Client
    }
  };

  // Loading state
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
  
  // Error state
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500">Error: {error.message}</div>
    </div>
  );

  // Sort todos based on selected criteria
  const sortedTodos = [...data.todos].sort((a, b) => {
    if (sortOption === 'timestamp') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.urgency || 0) - (a.urgency || 0);
    }
  });

  // Render the main container with all components
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <div className="flex items-center gap-4">
          <SortDropdown value={sortOption} onChange={setSortOption} />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteCompletedDialog(true)}
              disabled={!sortedTodos.some(todo => todo.completed)}
            >
              Delete Completed
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAllDialog(true)}
              disabled={!sortedTodos.length}
            >
              Delete All
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete all confirmation dialog */}
      <ConfirmDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
        title="Are you sure?"
        description="This will permanently delete all todos. This action cannot be undone."
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleDeleteAll}
      />

      {/* Delete completed confirmation dialog */}
      <ConfirmDialog
        open={showDeleteCompletedDialog}
        onOpenChange={setShowDeleteCompletedDialog}
        title="Delete Completed Todos?"
        description="This will permanently delete all completed todos. This action cannot be undone."
        confirmLabel="Delete Completed"
        variant="destructive"
        onConfirm={handleDeleteCompleted}
      />
      
      {/* Todo section with form and list */}
      <TodoSection
        todos={sortedTodos}
        loading={loading}
        suggestion=""
        onCreateTodo={handleCreateTodo}
        onToggleComplete={(id) => handleUpdateTodo(id, !sortedTodos.find((t: Todo) => t.id === id)?.completed)}
        onDelete={handleDelete}
        onUpdate={(id, title, urgency) => handleUpdateTodo(id, sortedTodos.find((t: Todo) => t.id === id)?.completed || false, urgency)}
        onGenerateSuggestions={generateMultipleSuggestions}
      />
      
      {/* Suggestions panel */}
      {showSuggestions && (
        <SuggestionPanel
          baseTodo={baseTodo}
          suggestions={currentSuggestions}
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          onApply={handleApplySuggestions}
          isLoading={isGeneratingSuggestions}
        />
      )}
    </div>
  );
} 