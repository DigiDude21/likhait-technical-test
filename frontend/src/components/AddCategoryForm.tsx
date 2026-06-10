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
      // The error from the API is already a message string
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
          setError(""); // Clear error when user types
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
