export function formatDisplayValue(value = '') {
  return value
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
