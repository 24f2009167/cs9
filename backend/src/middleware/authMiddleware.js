import User from '../models/user.model.js'
import { getPrimaryRole, getUserRoles } from '../services/role.service.js'
import { verifyAuthToken } from '../utils/auth-token.js'

const getTokenFromRequest = (req) => {
  // Prefer Authorization: Bearer <token> header (API clients, mobile)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim()
    if (bearer) {
      return bearer
    }
  }

  // Fall back to HTTP-only cookie (browser sessions)
  const cookieHeader = req.headers.cookie

  if (!cookieHeader) {
    return null
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [name, ...value] = cookie.trim().split('=')
      return [name, decodeURIComponent(value.join('='))]
    }),
  )

  return cookies.token || cookies.authToken || null
}

export const verifyToken = async (req, res, next) => {
  const token = getTokenFromRequest(req)

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    const decoded = verifyAuthToken(token)
    const user = await User.findOne({ user_id: decoded.userId })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account disabled' })
    }

    const roles = await getUserRoles(user)

    req.user = {
      userId: user.user_id,
      email: user.email,
      role: getPrimaryRole(roles),
      roles,
    }
    req.authUser = user

    return next()
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({ success: false, message: 'Expired token' })
    }

    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const checkRole = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !req.user.roles.some((role) => allowedRoles.includes(role))) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    return next()
  }
