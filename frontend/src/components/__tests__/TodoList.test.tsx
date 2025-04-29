import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TodoList from '../TodoList'
import { Todo } from '../../types/todo'

describe('TodoList', () => {
    const mockTodos: Todo[] = [
        {
            id: 1,
            title: 'Test Todo',
            completed: false,
            urgency: 1,
            createdAt: new Date().toISOString(),
            updatedAt: null
        }
    ]

    const mockOnToggleComplete = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnUpdate = vi.fn()

    it('renders empty state correctly', () => {
        render(
            <TodoList
                todos={[]}
                onToggleComplete={mockOnToggleComplete}
                onDelete={mockOnDelete}
                onUpdate={mockOnUpdate}
            />
        )
        expect(screen.queryByText('Your Todos')).toBeInTheDocument()
    })

    it('renders todos correctly', () => {
        render(
            <TodoList
                todos={mockTodos}
                onToggleComplete={mockOnToggleComplete}
                onDelete={mockOnDelete}
                onUpdate={mockOnUpdate}
            />
        )
        expect(screen.getByText('Test Todo')).toBeInTheDocument()
    })

    it('calls onToggleComplete when checkbox is clicked', () => {
        render(
            <TodoList
                todos={mockTodos}
                onToggleComplete={mockOnToggleComplete}
                onDelete={mockOnDelete}
                onUpdate={mockOnUpdate}
            />
        )
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
        expect(mockOnToggleComplete).toHaveBeenCalledWith(1)
    })

    it('calls onDelete when delete button is clicked', () => {
        render(
            <TodoList
                todos={mockTodos}
                onToggleComplete={mockOnToggleComplete}
                onDelete={mockOnDelete}
                onUpdate={mockOnUpdate}
            />
        )
        const deleteButton = screen.getByRole('button', { name: /delete/i })
        fireEvent.click(deleteButton)
        expect(mockOnDelete).toHaveBeenCalledWith(1)
    })
}) 