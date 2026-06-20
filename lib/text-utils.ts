/**
 * Vietnamese text normalization utilities
 * Handles accent removal and case conversion for search functionality
 */

/**
 * Remove Vietnamese accents from text
 * @param text - Text to normalize
 * @returns Text without Vietnamese accents
 */
export function removeVietnameseAccents(text: string): string {
  const map: { [key: string]: string } = {
    'a': 'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ',
    'A': 'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ',
    'd': 'đ',
    'D': 'Đ',
    'e': 'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
    'E': 'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|ỄỆ',
    'i': 'í|ì|ỉ|ĩ|ị',
    'I': 'Í|Ì|Ỉ|Ĩ|Ị',
    'o': 'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
    'O': 'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|ỠỢ',
    'u': 'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
    'U': 'Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự',
    'y': 'ý|ỳ|ỷ|ỹ|ỵ',
    'Y': 'Ý|Ỳ|Ỷ|Ỹ|Ỵ'
  };

  let result = text;
  for (const [nonAccent, accented] of Object.entries(map)) {
    result = result.replace(new RegExp(accented, 'g'), nonAccent);
  }
  return result;
}

/**
 * Normalize Vietnamese text for search
 * Removes accents and converts to lowercase
 * @param text - Text to normalize
 * @returns Normalized text for search comparison
 */
export function normalizeVietnameseText(text: string): string {
  return removeVietnameseAccents(text).toLowerCase().trim();
}

/**
 * Check if two Vietnamese texts match (case and accent insensitive)
 * @param text1 - First text
 * @param text2 - Second text
 * @returns True if texts match after normalization
 */
export function vietnameseTextMatch(text1: string, text2: string): boolean {
  return normalizeVietnameseText(text1) === normalizeVietnameseText(text2);
}

/**
 * Check if text contains search term (case and accent insensitive)
 * @param text - Text to search in
 * @param searchTerm - Search term
 * @returns True if text contains search term after normalization
 */
export function vietnameseTextContains(text: string, searchTerm: string): boolean {
  const normalizedText = normalizeVietnameseText(text);
  const normalizedSearch = normalizeVietnameseText(searchTerm);
  return normalizedText.includes(normalizedSearch);
}
