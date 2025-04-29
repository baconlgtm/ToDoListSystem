/**
 * TodoSection Component
 * 
 * A comprehensive component that manages both todo creation and list display.
 * Combines the functionality of the former TodoForm and TodoList components.
 * 
 * Features:
 * - Todo creation form with urgency selection
 * - List of todos with sorting and filtering
 * - Bulk actions (delete all, delete completed)
 * - AI suggestion generation
 * - Individual todo management (edit, delete, complete)
 */

import React, { useState } from 'react';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { FiPlus } from 'react-icons/fi';
import { UrgencySelector } from './ui/UrgencySelector';

interface TodoSectionProps {
    todos: Todo[];
    loading?: boolean;
    suggestion?: string;
    onCreateTodo: (title: string, urgency: number) => void;
    onToggleComplete: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, title: string, urgency: number) => void;
    onGenerateSuggestions: (title: string, urgency: number) => void;
}

const TodoSection: React.FC<TodoSectionProps> = ({
    todos,
    loading = false,
    suggestion,
    onCreateTodo,
    onToggleComplete,
    onDelete,
    onUpdate,
    onGenerateSuggestions,
}) => {
    // Form state
    const [title, setTitle] = useState('');
    const [urgency, setUrgency] = useState(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onCreateTodo(title.trim(), urgency);
        setTitle('');
        setUrgency(1);
    };

    const handleUseSuggestion = () => {
        if (suggestion) {
            setTitle(suggestion);
        }
    };

    return (
        <div className="space-y-6">
            {/* Todo Creation Form */}
            <Card className="mb-6">
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <UrgencySelector
                            value={urgency}
                            onChange={setUrgency}
                        />
                        <Button type="submit" className="flex items-center gap-2">
                            <FiPlus className="h-4 w-4" />
                            Add
                        </Button>
                    </div>
                    {suggestion && (
                        <div className="mt-2 text-sm text-gray-500" data-testid="suggestion-container">
                            Suggestion: {suggestion}
                            <button
                                type="button"
                                onClick={handleUseSuggestion}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                                Use
                            </button>
                        </div>
                    )}
                </form>
            </Card>

            {/* Todo List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Your Todos</h2>
                </div>

                <div className="space-y-2">
                    {todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onGenerateSuggestions={onGenerateSuggestions}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TodoSection; 