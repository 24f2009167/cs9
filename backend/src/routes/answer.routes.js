import { Router } from 'express'
import {
  deleteAnswer,
  updateAnswer,
  voteAnswer,
} from '../controllers/answer.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)
router.patch('/:answerId', checkRole('USER', 'RESOLVER', 'ADMIN'), updateAnswer)
router.delete('/:answerId', checkRole('USER', 'ADMIN'), deleteAnswer)
router.post('/:answerId/vote', checkRole('USER', 'RESOLVER', 'ADMIN'), voteAnswer)

export default router
