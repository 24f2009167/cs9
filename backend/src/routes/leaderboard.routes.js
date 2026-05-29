import { Router } from 'express'
import { getLeaderboard } from '../controllers/spark.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', verifyToken, checkRole('USER', 'RESOLVER', 'ADMIN'), getLeaderboard)

export default router
