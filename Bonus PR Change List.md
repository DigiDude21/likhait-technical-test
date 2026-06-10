# BONUS-001: Prevent Future Date Expense Creation

## 📋 Summary

Implemented frontend and backend validation to prevent users from creating expenses with dates in the future. The expense form now defaults to today's date, restricts future date selection through the date picker, validates manually entered future dates, and displays a clear error message when invalid dates are submitted.

## 🔧 Technical Implementation

### Backend Model Validation

**File**: `backend/app/models/expense.rb`

Added a custom validation to ensure expense dates cannot be set later than the current day.

class Expense < ApplicationRecord
  belongs_to :category

  validates :description, presence: true, length: { minimum: 1, maximum: 500 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true
  validates :category_id, presence: true
  validates :payer_name, presence: true, length: { minimum: 1, maximum: 100 }

  validate :date_cannot_be_in_future

  private

  def date_cannot_be_in_future
    return if date.blank?

    if date > Date.current
      errors.add(:date, "cannot be in the future")
    end
  end
end


What changed:
- Added server-side validation to reject future dates even if requests bypass frontend

---

### Frontend Hook Validation

**File**: `frontend/src/hooks/useExpenseForm.ts`

Added client-side validation to detect future dates before form submission.

if (!formData.date) {
  newErrors.date = "Date is required";
} else {
  const selectedDate = new Date(formData.date);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    newErrors.date = "Future dates are not allowed";
  }
}

What changed:
- Users now get immediate validation feedback for future dates

---

### Frontend Date Picker Restriction

**File**: `frontend/src/components/ExpenseForm.tsx`

<TextField
  label="Date"
  type="date"
  value={formData.date}
  max={new Date().toISOString().split("T")[0]}
  onChange={(e) => handleChange("date", e.target.value)}
  error={errors.date}
  fullWidth
  required
/>

What changed:
- Disabled future date selection in the browser date picker

---

### Default Date Behavior

**File**: `frontend/src/components/ExpenseForm.tsx`

date: initialData?.date || formatDate(new Date())

What changed:
- Form defaults to today's date for new expenses

---

## 🧪 Testing Workflow

- Rebuild app with docker compose down -v && docker compose up --build
- Open http://localhost:5173
- Verify date defaults to today in form
- Try selecting a future date (should be blocked)
- Manually enter future date (should show error)
- Submit invalid date (should be rejected)
- Confirm valid past/today dates work correctly

---

## ✨ User Experience

- Date field defaults to today
- Future dates cannot be selected
- Manual future date entries show error
- Clear validation message shown under date field
- Backend prevents invalid API submissions
- Consistent validation across frontend and backend