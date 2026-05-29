import { validationResult } from 'express-validator'
import argon2 from 'argon2'
import UserProfile from '../models/user-profile.model.js'
import User from '../models/user.model.js'
import UserRoleMapper from '../models/user-role-mapper.model.js'
import { getPrimaryRole, getUserRoles, ensureRole } from '../services/role.service.js'
import { awardSpark } from '../services/spark.service.js'
import { signAuthToken } from '../utils/auth-token.js'
import { createHttpError } from '../utils/http.js'

const cookieName = 'token'

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

function safeUser(user, roles, profile = null) {
  return {
    userId: user.user_id,
    name: profile?.display_name || user.name,
    email: user.email,
    role: getPrimaryRole(roles),
    roles,
    status: user.status || 'active',
  }
}

/**
 * Validates password strength — mirrors frontend usePasswordStrength checks.
 * Requires at least 3 of 5 criteria met (score >= 60):
 *   1. length >= 8
 *   2. contains uppercase
 *   3. contains lowercase
 *   4. contains digit
 *   5. contains special character
 */
export function validatePassword(password) {
  if (typeof password !== 'string') {
    throw createHttpError(400, 'Password must be a string')
  }

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  ]

  const score = checks.filter(Boolean).length * 20

  if (score < 60) {
    const messages = []
    if (!checks[0]) messages.push('at least 8 characters')
    if (!checks[1]) messages.push('an uppercase letter')
    if (!checks[2]) messages.push('a lowercase letter')
    if (!checks[3]) messages.push('a number')
    if (!checks[4]) messages.push('a special character')
    throw createHttpError(
      400,
      `Password is too weak. Must have at least 3 of: ${messages.join(', ')}`
    )
  }
}

export async function signup(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createHttpError(400, errors.array()[0].msg)
    }

    const requestedRole =
      typeof req.body.role === 'string' ? req.body.role.toUpperCase() : 'USER'

    if (requestedRole !== 'USER') {
      throw createHttpError(403, 'Privileged roles must be assigned by an admin')
    }

    validatePassword(req.body.password)
    const role = await ensureRole('USER')
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: await argon2.hash(req.body.password),
    })

    await UserRoleMapper.create({
      user_id: user.user_id,
      role_id: role.role_id,
    })
    const profile = await UserProfile.create({ user_id: user.user_id, display_name: user.name })

    const responseUser = safeUser(user, ['USER'], profile)
    res.status(201).json({
      success: true,
      userId: user.user_id,
      role: 'USER',
      message: 'Signup successful',
      user: responseUser,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createHttpError(400, errors.array()[0].msg)
    }

    const email =
      typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''
    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user || !password || !(await argon2.verify(user.passwordHash, password))) {
      throw createHttpError(401, 'Invalid email or password')
    }

    if (user.status && user.status !== 'active') {
      throw createHttpError(403, 'Account disabled')
    }

    const roles = await getUserRoles(user)
    const profile = await UserProfile.findOne({ user_id: user.user_id }).lean()
    const today = new Date().toISOString().slice(0, 10)
    const previousLoginDay = user.last_login_at?.toISOString().slice(0, 10)

    if (previousLoginDay !== today) {
      await awardSpark({ userId: user.user_id, action: 'DAILY_LOGIN' })
    }

    await User.updateOne(
      { user_id: user.user_id },
      { $set: { last_login_at: new Date() } },
    )

    res.cookie(cookieName, signAuthToken({ userId: user.user_id }), cookieOptions())
    const responseUser = safeUser(user, roles, profile)

    res.json({
      success: true,
      user: responseUser,
    })
  } catch (error) {
    next(error)
  }
}

export function logout(_req, res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  res.json({ success: true, message: 'Logged out successfully' })
}

export async function me(req, res, next) {
  try {
    const profile = await UserProfile.findOne({ user_id: req.user.userId }).lean()
    const responseUser = safeUser(req.authUser, req.user.roles, profile)

    res.json({
      success: true,
      user: responseUser,
    })
  } catch (error) {
    next(error)
  }
}
