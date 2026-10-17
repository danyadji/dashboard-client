/**
 * Utility to decode HTML entities from WordPress text (e.g., &amp; -> &, &#038; -> &)
 * Safely decodes text into plain text without any risk of script execution.
 */
export function decodeHtml(str) {
  if (!str || typeof str !== 'string') return ''
  const doc = new DOMParser().parseFromString(str, 'text/html')
  return doc.body.textContent || ''
}
