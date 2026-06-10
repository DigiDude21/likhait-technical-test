class Expense < ApplicationRecord
  # ============================================================================
  # Associations
  # ============================================================================
  belongs_to :category

  # ============================================================================
  # Validations
  # ============================================================================
  # Ensure all required fields are present and valid
  validates :description, presence: true, length: { minimum: 1, maximum: 500 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :category_id, presence: true
  validates :payer_name, presence: true, length: { minimum: 1, maximum: 100 }

  # Prevent expenses from being created with future dates
  validate :date_cannot_be_in_future

  # ============================================================================
  # Scopes
  # ============================================================================
  # Retrieve expenses within a date range (used for calendar/month filtering)
  scope :between_dates, ->(start_date, end_date) {
    where(date: start_date..end_date).order(date: :desc)
  }

  # Retrieve expenses by category (used for category breakdown)
  scope :by_category, ->(category_id) {
    where(category_id: category_id)
  }

  private

  def date_cannot_be_in_future
    return if date.blank?

    if date > Date.current
      errors.add(:date, "cannot be in the future")
    end
  end
end
