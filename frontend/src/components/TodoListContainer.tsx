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
import { useToast } from "../components/ui/use-toast";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

export default function TodoListContainer() {
  const { toast } = useToast();
  
  // GraphQL queries and mutations
  const { loading, error, data } = useQuery(GET_TODOS);
  const [createTodo] = useMutation(CREATE_TODO, {
    onError: (error) => {
      toast({
        title: "Error creating todo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [updateTodo] = useMutation(UPDATE_TODO, {
    onError: (error) => {
      toast({
        title: "Error updating todo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [deleteTodo] = useMutation(DELETE_TODO, {
    onError: (error) => {
      toast({
        title: "Error deleting todo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [deleteAllTodos] = useMutation(DELETE_ALL_TODOS, {
    onError: (error) => {
      toast({
        title: "Error deleting all todos",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [deleteCompletedTodos] = useMutation(DELETE_COMPLETED_TODOS, {
    onError: (error) => {
      toast({
        title: "Error deleting completed todos",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [generateSuggestion] = useMutation(GENERATE_TODO_SUGGESTION);
  
  // State management
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [baseTodo, setBaseTodo] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string>();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [showDeleteCompletedDialog, setShowDeleteCompletedDialog] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('timestamp');

  const generateMultipleSuggestions = async (title: string, urgency: number) => {
    try {
      setIsGeneratingSuggestions(true);
      setSuggestionError(undefined);
      
      const { data } = await generateSuggestion({
        variables: {
          existingTodos: [title],
          urgency: urgency || 1
        }
      });
      
      setCurrentSuggestions(data?.generateTodoSuggestion?.suggestions || []);
      setBaseTodo(title);
      setShowSuggestions(true);
    } catch (error) {
      setSuggestionError(error instanceof Error ? error.message : 'Failed to generate suggestions');
      setCurrentSuggestions([]);
      setShowSuggestions(true);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleApplySuggestions = async (selectedSuggestions: { title: string; urgency: number }[]) => {
    try {
      const promises = selectedSuggestions.map(suggestion => 
        createTodo({ 
          variables: { 
            title: suggestion.title,
            urgency: suggestion.urgency
          },
          optimisticResponse: {
            createTodo: {
              id: Date.now(),
              title: suggestion.title,
              completed: false,
              urgency: suggestion.urgency,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              __typename: "Todo"
            }
          },
          update: (cache, { data }) => {
            const existingTodos = cache.readQuery<{ todos: Todo[] }>({
              query: GET_TODOS
            });
            
            if (existingTodos && data) {
              cache.writeQuery({
                query: GET_TODOS,
                data: {
                  todos: [...existingTodos.todos, data.createTodo]
                }
              });
            }
          }
        })
      );
      
      await Promise.all(promises);
      setShowSuggestions(false);
      toast({
        title: "Success",
        description: `Added ${selectedSuggestions.length} new todos`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add suggestions",
        variant: "destructive",
      });
    }
  };

  const handleCreateTodo = async (title: string, urgency: number) => {
    try {
      await createTodo({
        variables: { title, urgency },
        optimisticResponse: {
          createTodo: {
            id: Date.now(),
            title,
            completed: false,
            urgency,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __typename: "Todo"
          }
        },
        update: (cache, { data }) => {
          const existingTodos = cache.readQuery<{ todos: Todo[] }>({
            query: GET_TODOS
          });
          
          if (existingTodos && data) {
            cache.writeQuery({
              query: GET_TODOS,
              data: {
                todos: [...existingTodos.todos, data.createTodo]
              }
            });
          }
        }
      });
      
      toast({
        title: "Success",
        description: "Todo created successfully",
      });
    } catch (error) {
      // Error handling is managed by Apollo Client and toast
    }
  };

  const handleUpdateTodo = async (id: number, completed: boolean, urgency?: number) => {
    try {
      await updateTodo({
        variables: { 
          id, 
          completed, 
          urgency: urgency !== undefined ? Number(urgency) : undefined 
        },
        optimisticResponse: {
          updateTodo: {
            id,
            completed,
            urgency: urgency !== undefined ? Number(urgency) : undefined,
            __typename: "Todo"
          }
        }
      });
    } catch (error) {
      // Error handling is managed by Apollo Client and toast
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo({
        variables: { id },
        optimisticResponse: {
          deleteTodo: {
            id,
            __typename: "Todo"
          }
        },
        update: (cache) => {
          const existingTodos = cache.readQuery<{ todos: Todo[] }>({
            query: GET_TODOS
          });
          
          if (existingTodos) {
            cache.writeQuery({
              query: GET_TODOS,
              data: {
                todos: existingTodos.todos.filter(todo => todo.id !== id)
              }
            });
          }
        }
      });
    } catch (error) {
      // Error handling is managed by Apollo Client and toast
    }
  };

  /**
   * Delete all todo items
   */
  const handleDeleteAll = async () => {
    try {
      await deleteAllTodos({
        update: (cache) => {
          cache.writeQuery({
            query: GET_TODOS,
            data: {
              todos: []
            }
          });
        }
      });
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
      await deleteCompletedTodos({
        update: (cache) => {
          const existingTodos = cache.readQuery<{ todos: Todo[] }>({
            query: GET_TODOS
          });
          
          if (existingTodos) {
            cache.writeQuery({
              query: GET_TODOS,
              data: {
                todos: existingTodos.todos.filter(todo => !todo.completed)
              }
            });
          }
        }
      });
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
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading todos: {error.message}</AlertDescription>
      </Alert>
    </div>
  );

  // Sort todos based on selected criteria
  const sortedTodos = [...data.todos].sort((a: Todo, b: Todo) => {
    if (sortOption === 'timestamp') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.urgency - a.urgency;
    }
  });

  // Render the main container with all components
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <div className="flex items-center space-x-4">
          <SortDropdown value={sortOption} onChange={setSortOption} />
          <Button
            variant="outline"
            onClick={() => setShowDeleteCompletedDialog(true)}
            className="text-sm"
          >
            Delete Completed
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteAllDialog(true)}
            className="text-sm"
          >
            Delete All
          </Button>
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
          error={suggestionError}
        />
      )}
    </div>
  );
} 