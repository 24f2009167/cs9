import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return process.env.JWT_SECRET
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function signature(unsignedToken) {
  return createHmac('sha256', getSecret())
    .update(unsignedToken)
    .digest('base64url')
}

export function signAuthToken(payload, ttlSeconds = TOKEN_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const body = encode({ ...payload, iat: now, exp: now + ttlSeconds })
  const unsignedToken = `${header}.${body}`

  return `${unsignedToken}.${signature(unsignedToken)}`
}

export function verifyAuthToken(token) {
  const parts = typeof token === 'string' ? token.split('.') : []

  if (parts.length !== 3) {
    throw new Error('Invalid token')
  }

  const unsignedToken = `${parts[0]}.${parts[1]}`
  const expected = Buffer.from(signature(unsignedToken))
  const supplied = Buffer.from(parts[2])

  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new Error('Invalid token')
  }

  let payload

  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  } catch (error) {
    throw new Error('Invalid token', { cause: error })
  }

  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    const error = new Error('Expired token')
    error.code = 'TOKEN_EXPIRED'
    throw error
  }

  return payload
}
