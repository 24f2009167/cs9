import { Router } from 'express'
import {
  assignUserRole,
  getAdminDashboard,
  listAdminSparkTransactions,
  removeUserRole,
} from '../controllers/admin.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('ADMIN'))

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: Get platform metrics for the admin dashboard
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard metrics.
 */
router.get('/dashboard', getAdminDashboard)
router.post('/users/:userId/roles', assignUserRole)
router.delete('/users/:userId/roles/:roleName', removeUserRole)
router.get('/sparks/transactions', listAdminSparkTransactions)

export default router
