class Api::CategoriesController < ApplicationController
  # ============================================================================
  # GET /api/categories
  # ============================================================================
  # Returns all categories sorted alphabetically
  #
  # Response (200 OK):
  #   [
  #     { "id": 1, "name": "Food", "created_at": "...", "updated_at": "..." },
  #     { "id": 2, "name": "Transport", "created_at": "...", "updated_at": "..." }
  #   ]
  def index
    categories = Category.alphabetical
    render json: categories
  end

  # ============================================================================
  # POST /api/categories
  # ============================================================================
  # Creates a new category with the provided name
  #
  # Request body:
  #   { "category": { "name": "Groceries" } }
  #
  # Response (201 Created):
  #   { "id": 3, "name": "Groceries", "created_at": "...", "updated_at": "..." }
  #
  # Response (422 Unprocessable Entity):
  #   { "errors": ["Name has already been taken"] }
  def create
    category = Category.new(category_params)

    if category.save
      render json: category, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # ============================================================================
  # Private Methods
  # ============================================================================
  private

  # Strong parameters - only allow 'name' to prevent mass assignment vulnerabilities
  def category_params
    params.require(:category).permit(:name)
  end
end
