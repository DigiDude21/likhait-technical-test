class Api::ExpensesController < ApplicationController
  # ============================================================================
  # GET /api/expenses
  # ============================================================================
  # Returns expenses for a specific month/year or all expenses if no filter provided
  #
  # Query parameters:
  #   year (optional): Year to filter by
  #   month (optional): Month (1-12) to filter by
  #
  # Response (200 OK):
  #   [
  #     { "id": 1, "description": "Groceries", "amount": 45.50, "category": "Food", ... },
  #     { "id": 2, "description": "Gas", "amount": 60.00, "category": "Transport", ... }
  #   ]
  def index
    # Using includes to prevent N+1 queries (loads categories with expenses in one query)
    expenses = Expense.includes(:category).order(created_at: :desc)

    if params[:year].present? && params[:month].present?
      year = params[:year].to_i
      month = params[:month].to_i

      start_date = Date.new(year, month, 1)
      end_date = start_date.end_of_month

      # IMPORTANT: Filter by 'date' not 'created_at'
      # This ensures calendar shows expenses on the day they occurred,
      # not when they were created. User creates expense on Jan 5 for Jan 3?
      # It shows on Jan 3 in the calendar, not Jan 5.
      expenses = expenses.where(date: start_date..end_date)
    end

    render json: expenses.map { |expense| format_expense(expense) }
  end

  # ============================================================================
  # POST /api/expenses
  # ============================================================================
  # Creates a new expense
  #
  # Request body:
  #   {
  #     "expense": {
  #       "description": "Groceries",
  #       "amount": "45.50",
  #       "payer_name": "Alice",
  #       "category_id": 1,
  #       "date": "2024-01-15"
  #     }
  #   }
  #
  # Response (201 Created):
  #   { "id": 3, "description": "Groceries", "amount": 45.50, "payer_name": "Alice", ... }
  #
  # Response (422 Unprocessable Entity):
  #   { "errors": ["Amount must be greater than 0"] }
  def create
    expense = Expense.new(expense_params)

    if expense.save
      render json: format_expense(expense), status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ============================================================================
  # PUT /api/expenses/:id
  # ============================================================================
  # Updates an existing expense
  #
  # Request body: Same as POST
  #
  # Response (200 OK): Updated expense
  # Response (422 Unprocessable Entity): Validation errors
  # Response (404 Not Found): Expense doesn't exist
  def update
    expense = Expense.find(params[:id])

    if expense.update(expense_params)
      render json: format_expense(expense)
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ============================================================================
  # DELETE /api/expenses/:id
  # ============================================================================
  # Deletes an expense
  #
  # Response (204 No Content): Success
  # Response (404 Not Found): Expense doesn't exist
  def destroy
    expense = Expense.find(params[:id])
    expense.destroy
    head :no_content
  end

  # ============================================================================
  # Private Methods
  # ============================================================================
  private

  # Strong parameters - only allow specific fields to prevent mass assignment
  def expense_params
    params.require(:expense).permit(:description, :amount, :category_id, :date, :payer_name)
  end

  # Format expense for JSON response
  # Converts category association to just the name for consistency
  def format_expense(expense)
    {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.to_f,
      category: expense.category.name,
      payer_name: expense.payer_name,
      date: expense.date.to_s,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    }
  end
end
