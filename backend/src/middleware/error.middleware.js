export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || error.status || 500
  let message = error.message || 'Internal server error'

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ')
  }

  if (error.code === 11000) {
    statusCode = 409
    message = 'A record with those values already exists'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  })
}
