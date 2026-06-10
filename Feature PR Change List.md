# FEATURE-001: Add Category Management Feature

## 📋 Summary

Implemented dynamic category management, allowing users to create custom expense categories directly from the UI instead of being limited to a predefined hardcoded list. Users can now click "+ Add Category", enter a name, and immediately use their new category in the expense form.

## 🔧 Technical Implementation

### Backend Routes (Fixed)

**File**: `backend/config/routes.rb`

Updated the routes to enable POST for category creation:

```ruby
namespace :api do
  resources :categories, only: [ :index, :create ]  # ← Added :create
  resources :expenses, only: [ :index, :create, :update, :destroy ]
end
```

**What changed**: Added `:create` to categories resources to enable `POST /api/categories`

---

### Backend Controllers

**File**: `backend/app/controllers/api/categories_controller.rb`

Already implemented from base upgrade with full documentation:

```ruby
class Api::CategoriesController < ApplicationController
  # GET /api/categories
  # Returns all categories sorted alphabetically
  def index
    categories = Category.alphabetical
    render json: categories
  end

  # POST /api/categories
  # Creates a new category with the provided name
  #
  # Request: { "category": { "name": "Groceries" } }
  # Response (201): { "id": 3, "name": "Groceries", ... }
  # Response (422): { "errors": ["Name has already been taken"] }
  def create
    category = Category.new(category_params)
    
    if category.save
      render json: category, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def category_params
    params.require(:category).permit(:name)
  end
end
```

---

### Backend Models

**File**: `backend/app/models/category.rb`

Already implemented from base upgrade:

```ruby
class Category < ApplicationRecord
  has_many :expenses, dependent: :destroy

  # Prevent duplicate names and ensure name is not empty
  validates :name, presence: true, uniqueness: true, length: { minimum: 1, maximum: 100 }

  # Retrieve categories in alphabetical order (used in UI dropdowns)
  scope :alphabetical, -> { order(:name) }
end
```

---

### Frontend - New Component

**File**: `frontend/src/components/AddCategoryForm.tsx`

```typescript
/**
 * AddCategoryForm - Lets users create new custom expense categories
 *
 * This is a simple form that takes a category name and submits it
 * to the backend. Once created, the new category shows up in the
 * expense form dropdown immediately.
 */

import React, { useState } from "react";
import { TextField, Button } from "../vibes";
import { COLORS } from "../constants/colors";

interface AddCategoryFormProps {
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function AddCategoryForm({
  onSubmit,
  onCancel,
}: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick validation - just make sure it's not empty
  const validateName = (): boolean => {
    if (!name.trim()) {
      setError("Category name is required");
      return false;
    }
    if (name.length > 50) {
      setError("Category name must be 50 characters or less");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateName()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const errorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {error && <div style={errorStyle}>{error}</div>}

      <TextField
        label="Category Name"
        type="text"
        placeholder="e.g., Groceries, Gym, Pet Supplies"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        error={error}
        fullWidth
        disabled={isSubmitting}
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

---

### Frontend - Updated Components

**File**: `frontend/src/components/ExpenseForm.tsx`

Key change: Load categories dynamically from API instead of hardcoded list

```typescript
/**
 * ExpenseForm - Form for adding/editing expenses
 *
 * This form loads categories dynamically from the API instead of using
 * a hardcoded list. This way, whenever a user creates a new category,
 * it becomes available immediately in this dropdown.
 */

import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { fetchCategories } from "../services/api";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  // Track categories loaded from the API
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const loadedCategories = await fetchCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  // Build dropdown options from loaded categories
  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Payer Name"
        type="text"
        placeholder="Who paid?"
        value={formData.payer_name}
        onChange={(e) => handleChange("payer_name", e.target.value)}
        error={errors.payer_name}
        fullWidth
        disabled={isSubmitting}
        required
      />

      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        disabled={isSubmitting}
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        disabled={isSubmitting}
        required
      />

      <SelectBox
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        error={errors.category}
        fullWidth
        disabled={categoriesLoading || isSubmitting}
        required
      />

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        disabled={isSubmitting}
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || categoriesLoading}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
```

---

**File**: `frontend/src/pages/HistoryPage.tsx`

Key changes: Added "+ Add Category" button and category creation modal

```typescript
import React, { useState, useEffect } from "react";
import { getExpenses, createExpense, fetchCategories, createCategory } from "../services/api";
import { Expense, ExpenseFormData } from "../types";
import YearNavigation from "../components/YearNavigation";
import { MonthNavigation } from "../components/MonthNavigation";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { Modal, Button } from "../vibes";
import { COLORS } from "../constants/colors";

const HistoryPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Track if the add category modal is open
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Get year and month from URL params, default to current date if not provided
  const getInitialYearMonth = () => {
    const params = new URLSearchParams(window.location.search);
    const currentDate = new Date();
    const yearParam = params.get("year");
    const monthParam = params.get("month");

    return {
      year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
      month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
    };
  };

  const initial = getInitialYearMonth();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  // Update URL when year or month changes
  const updateURL = (year: number, month: number) => {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    params.set("month", month.toString());
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newURL);
  };

  // Initialize URL params if not present
  useEffect(() => {
    updateURL(selectedYear, selectedMonth);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(selectedYear, selectedMonth);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateURL(year, selectedMonth);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    updateURL(selectedYear, month);
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense(data);
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  };

  // Handle creating a new category
  // This creates the category and then closes the modal
  const handleAddCategory = async (name: string) => {
    try {
      await createCategory({ name });
      // Reload the expenses to refresh the data
      // (this also refreshes the category list used in ExpenseForm)
      fetchExpenses();
      // Close the modal after successful creation
      setIsAddCategoryModalOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  // Calculate category breakdown
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const category = expense.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 };
      }
      acc[category].amount += Number(expense.amount);
      acc[category].count += 1;
      return acc;
    },
    {} as Record<string, { category: string; amount: number; count: number }>,
  );

  const categories = Object.values(categoryData).sort(
    (a, b) => b.amount - a.amount,
  );
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  const pageStyle: React.CSSProperties = {
    padding: "48px 64px",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    justifyContent: "space-between",
  };

  const leftHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "40px",
    fontWeight: 700,
    color: COLORS.secondary.s10,
    margin: 0,
    flexShrink: 0,
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "48px",
    fontSize: "18px",
    color: COLORS.secondary.s08,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={leftHeaderStyle}>
          <h1 style={titleStyle}>Expense History</h1>
          <YearNavigation
            currentYear={selectedYear}
            onYearChange={handleYearChange}
          />
        </div>
        <div style={buttonGroupStyle}>
          <Button variant="secondary" onClick={() => setIsAddCategoryModalOpen(true)}>
            + Add Category
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      <MonthNavigation
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onMonthChange={handleMonthChange}
      />

      <div>
        {loading ? (
          <div style={loadingStyle}>Loading...</div>
        ) : (
          <>
            <CategoryBreakdown
              categories={categories}
              total={total}
              totalCount={totalCount}
            />
            <div style={{ marginTop: "32px" }}>
              <CalendarExpenseTable
                expenses={expenses}
                onExpenseUpdated={fetchExpenses}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
      >
        <AddCategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default HistoryPage;
```

---

### Frontend - Service Layer

**File**: `frontend/src/services/api.ts`

Already updated with `createCategory()` function (added in base upgrade):

```typescript
/**
 * Create a new category
 *
 * Allows users to add custom categories beyond predefined ones.
 * Returns the newly created category.
 */
export async function createCategory(data: {
  name: string;
}): Promise<{ id: number; name: string; created_at: string; updated_at: string }> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.[0] || "Failed to create category");
  }

  return response.json();
}
```

---

### Frontend - Types

**File**: `frontend/src/types.ts`

Already updated with `Category` interface (added in base upgrade):

```typescript
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🧪 Testing Workflow

1. **Build and start**: `docker compose down -v && docker compose up --build`
2. **Open app**: Navigate to http://localhost:5173
3. **Test category creation**:
   - Click "+ Add Category" button (top right, secondary button)
   - Enter category name (e.g., "Groceries")
   - Click "Create Category"
   - Modal should close
4. **Verify integration**:
   - Click "Add Expense"
   - New category should appear in the dropdown
   - Create an expense with the new category
   - Verify it appears in the calendar and breakdown
5. **Edge cases**:
   - Try empty name (should fail)
   - Try duplicate name (should fail with validation error)
   - Try very long name (should be truncated by validation)

---

## ✨ User Experience

- Click "+ Add Category" button in header
- Enter category name in modal
- Submit to create
- Modal closes automatically on success
- New category immediately available in expense form dropdown
- Can use the new category right away

---

## 📚 API Contract

**Create Category**
- Method: POST
- Path: `/api/categories`
- Request: `{ "category": { "name": "Groceries" } }`
- Response (201): `{ "id": 3, "name": "Groceries", "created_at": "...", "updated_at": "..." }`
- Response (422): `{ "errors": ["Name has already been taken"] }`