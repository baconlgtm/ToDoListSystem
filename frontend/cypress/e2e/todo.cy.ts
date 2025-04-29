/// <reference types="cypress" />

describe('Todo Application', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  it('should display the todo list', () => {
    cy.get('[data-testid="todo-list"]').should('exist')
  })

  it('should add a new todo', () => {
    const todoTitle = 'New Test Todo'
    const todoDescription = 'Test Description'

    // Fill and submit the form
    cy.get('[data-testid="todo-form"]').within(() => {
      cy.get('input[name="title"]').type(todoTitle)
      cy.get('textarea[name="description"]').type(todoDescription)
      cy.get('button[type="submit"]').click()
    })

    // Verify the new todo is displayed
    cy.get('[data-testid="todo-list"]').should('contain', todoTitle)
    cy.get('[data-testid="todo-list"]').should('contain', todoDescription)
  })

  it('should toggle todo completion', () => {
    // First create a todo
    cy.get('[data-testid="todo-form"]').within(() => {
      cy.get('input[name="title"]').type('Toggle Test Todo')
      cy.get('textarea[name="description"]').type('Toggle Description')
      cy.get('button[type="submit"]').click()
    })

    // Find the checkbox and toggle it
    cy.get('[data-testid="todo-item"]').first().within(() => {
      cy.get('input[type="checkbox"]').click()
    })

    // Verify the todo is marked as completed
    cy.get('[data-testid="todo-item"]').first().should('have.class', 'completed')
  })

  it('should delete a todo', () => {
    // First create a todo
    cy.get('[data-testid="todo-form"]').within(() => {
      cy.get('input[name="title"]').type('Delete Test Todo')
      cy.get('textarea[name="description"]').type('Delete Description')
      cy.get('button[type="submit"]').click()
    })

    // Get the initial count of todos
    cy.get('[data-testid="todo-item"]').its('length').then(initialCount => {
      // Click the delete button
      cy.get('[data-testid="todo-item"]').first().within(() => {
        cy.get('button').contains('Delete').click()
      })

      // Verify the count decreased by 1
      cy.get('[data-testid="todo-item"]').should('have.length', initialCount - 1)
    })
  })

  it('should handle errors gracefully', () => {
    // Simulate a network error
    cy.intercept('POST', '/api/todos', {
      statusCode: 500,
      body: { error: 'Server Error' }
    })

    // Try to create a todo
    cy.get('[data-testid="todo-form"]').within(() => {
      cy.get('input[name="title"]').type('Error Test Todo')
      cy.get('textarea[name="description"]').type('Error Description')
      cy.get('button[type="submit"]').click()
    })

    // Verify error message is displayed
    cy.get('[data-testid="error-message"]').should('be.visible')
  })
}) 