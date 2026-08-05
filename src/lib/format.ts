/**
 * SWAPI encodes absent data as these strings rather than as null, so they have
 * to be caught at render time or the UI shows the user the word "unknown" in a
 * field that simply has no value.
 */
const SENTINELS = new Set(['unknown', 'n/a', 'none', 'not applicable'])

export const EM_DASH = '—'

export function formatValue(value: string | number): string {
  if (typeof value === 'number') return String(value)

  const trimmed = value.trim()
  if (trimmed === '' || SENTINELS.has(trimmed.toLowerCase())) return EM_DASH
  return trimmed
}

/** SWAPI field names that are acronyms rather than words. */
const ACRONYMS = new Set(['MGLT'])

/** `hair_color` -> `Hair color`. */
export function formatLabel(key: string): string {
  if (ACRONYMS.has(key)) return key

  const spaced = key.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
