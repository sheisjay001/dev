export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Server Error' })
}
