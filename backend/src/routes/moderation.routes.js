import { Router } from 'express'
import {
  getModerationQueue,
  moderateContent,
  warnUser,
} from '../controllers/moderation.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('ADMIN'))
router.get('/queue', getModerationQueue)
router.patch('/content', moderateContent)
router.post('/users/:userId/warn', warnUser)

export default router
