// Utility functions

/**
 * Convert Vietnamese string to non-accented string for search
 * Example: "Đà Nẵng" -> "Da Nang"
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Normalize string for search (lowercase, remove accents, trim)
 */
export function normalizeForSearch(str: string): string {
  return removeVietnameseAccents(str.toLowerCase().trim());
}
