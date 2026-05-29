import { Router } from 'express'
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../controllers/comment.controller.js'
import { checkRole, verifyToken } from '../middleware/authMiddleware.js'

const router = Router()

router.use(verifyToken)
router.post('/', checkRole('USER', 'RESOLVER', 'ADMIN'), createComment)
router.get('/', checkRole('USER', 'RESOLVER', 'ADMIN'), listComments)
router.patch('/:commentId', checkRole('USER', 'RESOLVER', 'ADMIN'), updateComment)
router.delete('/:commentId', checkRole('USER', 'ADMIN'), deleteComment)

export default router
