import { Router } from 'express'
import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from '../controllers/profile.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('USER', 'RESOLVER', 'ADMIN'))
router.get('/me', getMyProfile)
router.patch('/me', updateMyProfile)
router.get('/:userId', getPublicProfile)

export default router
