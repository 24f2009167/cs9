import { Router } from 'express'
import { createFlag, listFlags, resolveFlag } from '../controllers/flag.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', verifyToken, checkRole('USER', 'RESOLVER', 'ADMIN'), createFlag)
router.get('/', verifyToken, checkRole('ADMIN'), listFlags)
router.patch('/:flagId/resolve', verifyToken, checkRole('ADMIN'), resolveFlag)

export default router
