import Flag from '../models/flag.model.js'
import Notification from '../models/notification.model.js'
import User from '../models/user.model.js'
import { applyModerationAction } from '../services/content.service.js'
import { flagsWithTargets } from './flag.controller.js'
import {
  createHttpError,
  getPagination,
  paginationResult,
} from '../utils/http.js'

export async function getModerationQueue(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = { status: req.query.status || 'pending' }

    if (req.query.targetType) {
      filter.target_type = req.query.targetType
    }

    const [flags, total] = await Promise.all([
      Flag.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      Flag.countDocuments(filter),
    ])

    res.json({
      success: true,
      items: await flagsWithTargets(flags),
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function moderateContent(req, res, next) {
  try {
    const { targetType, targetId, action, reason } = req.body

    if (!targetId) {
      throw createHttpError(400, 'Target id is required')
    }

    await applyModerationAction({
      targetType,
      targetId,
      action,
      reason,
      adminId: req.user.userId,
    })

    res.json({ success: true, message: 'Moderation action applied' })
  } catch (error) {
    next(error)
  }
}

export async function warnUser(req, res, next) {
  try {
    const user = await User.findOne({ user_id: req.params.userId })
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : ''
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : ''

    if (!user) {
      throw createHttpError(404, 'User not found')
    }
    if (!reason || !message) {
      throw createHttpError(400, 'Reason and message are required')
    }

    await Notification.create({
      recipient_id: user.user_id,
      actor_id: req.user.userId,
      type: 'warning',
      title: `Moderation warning: ${reason}`,
      body: message,
      reference_id: user.user_id,
      reference_type: 'user',
    })

    res.status(201).json({ success: true, message: 'Warning sent' })
  } catch (error) {
    next(error)
  }
}
