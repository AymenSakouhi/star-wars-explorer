import { describe, expect, it } from 'vitest'
import { EM_DASH, formatLabel, formatValue } from '@/lib/format'

describe('formatValue', () => {
  it('passes real values through', () => {
    expect(formatValue('blond')).toBe('blond')
  })

  it('renders SWAPI sentinels as an em dash', () => {
    expect(formatValue('unknown')).toBe(EM_DASH)
    expect(formatValue('n/a')).toBe(EM_DASH)
    expect(formatValue('none')).toBe(EM_DASH)
  })

  it('matches sentinels case-insensitively', () => {
    expect(formatValue('N/A')).toBe(EM_DASH)
    expect(formatValue('Unknown')).toBe(EM_DASH)
  })

  it('renders blank values as an em dash', () => {
    expect(formatValue('')).toBe(EM_DASH)
    expect(formatValue('   ')).toBe(EM_DASH)
  })

  it('trims surrounding whitespace from real values', () => {
    expect(formatValue('  arid  ')).toBe('arid')
  })

  it('stringifies numbers', () => {
    expect(formatValue(4)).toBe('4')
    expect(formatValue(0)).toBe('0')
  })

  it('does not mistake a value that merely contains a sentinel', () => {
    expect(formatValue('unknown regions')).toBe('unknown regions')
  })

  it('keeps values that describe absence but are real data', () => {
    // A droid's average lifespan really is "indefinite" — that is an answer,
    // not a missing value, so it must not be blanked out.
    expect(formatValue('indefinite')).toBe('indefinite')
  })
})

describe('formatLabel', () => {
  it('turns snake_case into sentence case', () => {
    expect(formatLabel('hair_color')).toBe('Hair color')
    expect(formatLabel('max_atmosphering_speed')).toBe('Max atmosphering speed')
  })

  it('leaves a single word capitalised', () => {
    expect(formatLabel('gender')).toBe('Gender')
  })

  it('keeps known acronyms uppercase', () => {
    expect(formatLabel('MGLT')).toBe('MGLT')
  })

  it('handles an empty string without throwing', () => {
    expect(formatLabel('')).toBe('')
  })
})
