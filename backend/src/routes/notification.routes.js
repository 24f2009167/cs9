import { Router } from 'express'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('USER', 'RESOLVER', 'ADMIN'))
router.get('/', listNotifications)
router.patch('/read-all', markAllNotificationsRead)
router.patch('/:notificationId/read', markNotificationRead)

export default router
