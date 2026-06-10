/**
 * Emoji mappings for expense categories
 */

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Education: "📚",
  Shopping: "🛍️",
  Work: "💼",
  Utilities: "📄",
  Other: "📦",
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || "📦";
}
