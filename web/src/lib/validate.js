export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).toLowerCase())
}
export function isNonEmpty(s) {
  return String(s || '').trim().length > 0
}
export function isPhone(s) {
  const v = String(s || '').trim()
  if (!v) return true
  return /^[0-9+\-\s()]+$/.test(v) && v.length <= 64
}
export function isPositiveNumber(n) {
  const x = Number(n)
  return Number.isFinite(x) && x > 0
}
