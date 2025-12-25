import { describe, it, expect } from 'vitest'
import { isEmail, isNonEmpty, isPhone, isPositiveNumber } from './validate.js'

describe('validate helpers', () => {
  it('email', () => {
    expect(isEmail('a@b.com')).toBe(true)
    expect(isEmail('bad')).toBe(false)
  })
  it('non empty', () => {
    expect(isNonEmpty('x')).toBe(true)
    expect(isNonEmpty('')).toBe(false)
  })
  it('phone', () => {
    expect(isPhone('+1 234-567')).toBe(true)
    expect(isPhone('abc')).toBe(false)
  })
  it('positive number', () => {
    expect(isPositiveNumber(1)).toBe(true)
    expect(isPositiveNumber('2')).toBe(true)
    expect(isPositiveNumber(0)).toBe(false)
    expect(isPositiveNumber(-1)).toBe(false)
  })
})
