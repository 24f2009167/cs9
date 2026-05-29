import { Router } from 'express'
import {
  getUserById,
  listUsers,
  updateUserStatus,
} from '../controllers/user.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List and filter users for administration
 *     tags: [Users, Admin]
 *     responses:
 *       200:
 *         description: Paginated users.
 *       403:
 *         description: ADMIN role required.
 */
router.get('/', verifyToken, checkRole('ADMIN'), listUsers)
router.get('/:userId', verifyToken, getUserById)
router.patch('/:userId/status', verifyToken, checkRole('ADMIN'), updateUserStatus)

export default router
