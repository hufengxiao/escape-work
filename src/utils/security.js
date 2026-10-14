/**
 * HTML Escaping & Sanitization Utilities
 * Prevents XSS injection when rendering dynamic user/character input into innerHTML
 */

/**
 * Escapes characters with special meaning in HTML
 * @param {unknown} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
