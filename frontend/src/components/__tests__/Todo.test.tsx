import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Todo from '../Todo'

describe('Todo Component', () => {
    const mockTodo = {
        id: 1,
        title: 'Test Todo',
        completed: false,
        urgency: 1, // low urgency
        createdAt: '2024-04-29T00:00:00Z',
        updatedAt: '2024-04-29T00:00:00Z'
    }

    it('renders the todo title', () => {
        render(<Todo {...mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onGenerateFollowUp={vi.fn()} />)
        expect(screen.getByText('Test Todo')).toBeInTheDocument()
    })

    it('shows the correct completion status', () => {
        render(<Todo {...mockTodo} completed={true} onToggle={vi.fn()} onDelete={vi.fn()} onGenerateFollowUp={vi.fn()} />)
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement
        expect(checkbox.checked).toBe(true)
    })

    it('calls onToggle when checkbox is clicked', () => {
        const onToggle = vi.fn()
        render(<Todo {...mockTodo} onToggle={onToggle} onDelete={vi.fn()} onGenerateFollowUp={vi.fn()} />)
        fireEvent.click(screen.getByRole('checkbox'))
        expect(onToggle).toHaveBeenCalledWith(1)
    })

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = vi.fn()
        render(<Todo {...mockTodo} onToggle={vi.fn()} onDelete={onDelete} onGenerateFollowUp={vi.fn()} />)
        fireEvent.click(screen.getByLabelText('Delete todo'))
        expect(onDelete).toHaveBeenCalledWith(1)
    })

    it('calls onGenerateFollowUp with correct title when generate button is clicked', () => {
        const onGenerateFollowUp = vi.fn()
        render(<Todo {...mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} onGenerateFollowUp={onGenerateFollowUp} />)
        const generateButton = screen.getByRole('button', { name: /generate/i })
        fireEvent.click(generateButton)
        expect(onGenerateFollowUp).toHaveBeenCalledWith('Test Todo')
    })
}) 