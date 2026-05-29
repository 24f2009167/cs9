import { Router } from 'express'
import {
  getResolverQueue,
  getResolverStats,
  updateResolverExpertise,
} from '../controllers/resolver.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('RESOLVER', 'ADMIN'))
router.get('/questions', getResolverQueue)
router.get('/stats', getResolverStats)
router.patch('/expertise', updateResolverExpertise)

export default router
