import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { login, logout, me, signup } from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, try again in 15 minutes.' },
})

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many signup attempts, try again later.' },
})

const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2–60 characters')
    .matches(/^[\p{L} '.\-]+$/u)
    .withMessage('Name contains invalid characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),
  body('password').exists().withMessage('Password required'),
]

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a user account with the USER role
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: Signup successful.
 *       403:
 *         description: Privileged roles must be assigned by an admin.
 */
router.post('/signup', signupLimiter, validateSignup, signup)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate and set the HTTP-only session cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required'),
]

router.post('/login', loginLimiter, validateLogin, login)
router.post('/logout', verifyToken, logout)
router.get('/me', verifyToken, me)

export default router