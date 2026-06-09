class Category < ApplicationRecord
  # ============================================================================
  # Associations
  # ============================================================================
  has_many :expenses, dependent: :destroy

  # ============================================================================
  # Validations
  # ============================================================================
  # Prevent duplicate category names and ensure name is not empty
  validates :name, presence: true, uniqueness: true, length: { minimum: 1, maximum: 50 }

  # ============================================================================
  # Scopes
  # ============================================================================
  # Retrieve categories in alphabetical order (used in UI dropdowns)
  scope :alphabetical, -> { order(:name) }
end
