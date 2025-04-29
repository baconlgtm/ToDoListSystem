import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TodoForm from '../TodoForm'

describe('TodoForm', () => {
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        mockOnSubmit.mockClear()
    })

    it('renders correctly', () => {
        render(<TodoForm onSubmit={mockOnSubmit} suggestion="" />)
        expect(screen.getByPlaceholder('Add a new todo...')).toBeInTheDocument()
        expect(screen.getByText('Add Todo')).toBeInTheDocument()
    })

    it('handles input change', () => {
        render(<TodoForm onSubmit={mockOnSubmit} suggestion="" />)
        const input = screen.getByPlaceholder('Add a new todo...') as HTMLInputElement
        fireEvent.change(input, { target: { value: 'Test todo' } })
        expect(input.value).toBe('Test todo')
    })

    it('calls onSubmit when form is submitted', () => {
        render(<TodoForm onSubmit={mockOnSubmit} suggestion="" />)
        const input = screen.getByPlaceholder('Add a new todo...')
        const button = screen.getByText('Add Todo')

        fireEvent.change(input, { target: { value: 'Test todo' } })
        fireEvent.click(button)

        expect(mockOnSubmit).toHaveBeenCalledWith('Test todo', 0)
    })

    it('clears input after submission', () => {
        render(<TodoForm onSubmit={mockOnSubmit} suggestion="" />)
        const input = screen.getByPlaceholder('Add a new todo...') as HTMLInputElement

        fireEvent.change(input, { target: { value: 'Test todo' } })
        fireEvent.click(screen.getByText('Add Todo'))

        expect(input.value).toBe('')
    })

    it('shows suggestion when provided', () => {
        render(<TodoForm onSubmit={mockOnSubmit} suggestion="Suggested todo" />)
        const input = screen.getByPlaceholder('Add a new todo...') as HTMLInputElement
        expect(input.value).toBe('Suggested todo')
    })
}) 