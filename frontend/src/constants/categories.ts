/**
 * Expense category constants
 * 
 * NOTE: Categories are primarily loaded from the API via fetchCategories().
 * These are legacy constants kept for reference only.
 * The actual categories used come from the backend database.
 */

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Work",
  "Utilities",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
