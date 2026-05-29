import { Router } from 'express'
import {
  getSparkBalance,
  listSparkTransactions,
} from '../controllers/spark.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken, checkRole('USER', 'RESOLVER', 'ADMIN'))
router.get('/balance', getSparkBalance)
router.get('/transactions', listSparkTransactions)

export default router
