/**
 * API service for communicating with the backend
 *
 * Handles all HTTP requests to the Rails API including:
 * - Fetching and creating expenses
 * - Managing categories
 * - Error handling and response parsing
 */

import { Expense, ExpenseFormData } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Fetch all expenses
 *
 * Returns all expenses ordered by creation date (newest first)
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch expenses for a specific year and month
 *
 * Used by calendar to show expenses for a given month.
 * Returns only expenses with dates in the specified month.
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch all available categories
 *
 * Used to populate category dropdowns in the expense form.
 * Returns categories sorted alphabetically from the backend.
 */
export async function fetchCategories(): Promise<
  Array<{ id: number; name: string; created_at?: string; updated_at?: string }>
> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

/**
 * Create a new expense
 *
 * Converts the form data (which uses category names) to the API format
 * (which uses category IDs). The API then formats the response back to
 * use category names for consistency in the UI.
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  // Look up the category ID from the provided category name
  const categories = await fetchCategories();
  const category = categories.find((c) => c.name === data.category);

  if (!category) {
    throw new Error(`Category "${data.category}" not found`);
  }

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: category.id,
    date: data.date,
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.[0] || "Failed to create expense");
  }

  return response.json();
}

/**
 * Update an existing expense
 *
 * Similar to create, converts category names to IDs for the API.
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  // If category is being updated, look up its ID
  let updateData: any = { ...data };
  if (data.category) {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.name === data.category);
    if (!category) {
      throw new Error(`Category "${data.category}" not found`);
    }
    updateData.category_id = category.id;
    delete updateData.category; // Remove category name, API uses ID
  }

  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: updateData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.[0] || "Failed to update expense");
  }

  return response.json();
}

/**
 * Delete an expense
 *
 * Removes the expense from the database permanently.
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}

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
