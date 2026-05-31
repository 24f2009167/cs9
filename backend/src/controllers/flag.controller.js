import Flag from '../models/flag.model.js'
import Notification from '../models/notification.model.js'
import User from '../models/user.model.js'
import { getUserRoles } from '../services/role.service.js'
import {
  applyModerationAction,
  findContentTarget,
  markContentPending,
} from '../services/content.service.js'
import {
  createHttpError,
  getPagination,
  paginationResult,
} from '../utils/http.js'

const reviewStatuses = {
  resolved: 'approved',
  dismissed: 'rejected',
  approved: 'approved',
  rejected: 'rejected',
}

function serialize(document) {
  const value = document?.toObject ? document.toObject() : document
  if (!value) {
    return null
  }
  delete value._id
  delete value.__v
  return value
}

async function flagsWithTargets(flags) {
  return Promise.all(
    flags.map(async (flag) => {
      const target = await findContentTarget(flag.target_type, flag.target_id)
      return { ...serialize(flag), target: serialize(target) }
    }),
  )
}

export async function createFlag(req, res, next) {
  try {
    const { targetType, targetId, reason, description } = req.body

    if (!targetId || typeof reason !== 'string' || !reason.trim()) {
      throw createHttpError(400, 'Target and reason are required')
    }

    const target = await findContentTarget(targetType, targetId)
    if (!target) {
      throw createHttpError(404, 'Target not found')
    }

    let flag
    try {
      flag = await Flag.create({
        target_type: targetType,
        target_id: targetId,
        reported_by: req.user.userId,
        reason: reason.trim(),
        notes: description,
      })
    } catch (error) {
      if (error.code === 11000) {
        throw createHttpError(409, 'Content has already been flagged by this user')
      }
      throw error
    }

    await markContentPending(targetType, targetId)

    res.status(201).json({
      success: true,
      flagId: flag.flag_id,
      message: 'Flag submitted',
    })
  } catch (error) {
    next(error)
  }
}

export async function listFlags(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = {}

    if (req.query.status) {
      filter.status = reviewStatuses[req.query.status] || req.query.status
    }
    if (req.query.targetType) {
      filter.target_type = req.query.targetType
    }
    if (req.query.reason) {
      filter.reason = req.query.reason
    }

    const [flags, total] = await Promise.all([
      Flag.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      Flag.countDocuments(filter),
    ])

    res.json({
      success: true,
      flags: await flagsWithTargets(flags),
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function resolveFlag(req, res, next) {
  try {
    const flag = await Flag.findOne({ flag_id: req.params.flagId })

    if (!flag) {
      throw createHttpError(404, 'Flag not found')
    }
    if (flag.status !== 'pending') {
      throw createHttpError(409, 'Flag already resolved')
    }

    const status = reviewStatuses[req.body.status]
    if (!status) {
      throw createHttpError(400, 'Status must be resolved, dismissed, approved, or rejected')
    }

    const allowedActions = [
      undefined,
      'no_action',
      'hide_content',
      'delete_content',
      'warn_user',
      'suspend_user',
    ]
    if (!allowedActions.includes(req.body.action)) {
      throw createHttpError(400, 'Invalid flag resolution action')
    }

    const actionMap = { hide_content: 'hide', delete_content: 'delete' }
    if (actionMap[req.body.action]) {
      await applyModerationAction({
        targetType: flag.target_type,
        targetId: flag.target_id,
        action: actionMap[req.body.action],
        adminId: req.user.userId,
        reason: req.body.resolutionNote,
      })
    }

    if (req.body.action === 'warn_user' || req.body.action === 'suspend_user') {
      const target = await findContentTarget(flag.target_type, flag.target_id)
      const targetUserId = target?.author_id

      if (!targetUserId) {
        throw createHttpError(404, 'Target author not found')
      }

      if (req.body.action === 'suspend_user') {
        const targetUser = await User.findOne({ user_id: targetUserId })

        if (!targetUser) {
          throw createHttpError(404, 'Target author not found')
        }
        if ((await getUserRoles(targetUser)).includes('ADMIN')) {
          throw createHttpError(409, 'Suspend admins through user status management')
        }

        await User.updateOne(
          { user_id: targetUser.user_id },
          {
            $set: {
              status: 'suspended',
              status_reason: req.body.resolutionNote || 'Content moderation',
              status_updated_by: req.user.userId,
              status_updated_at: new Date(),
            },
          },
        )
      }

      await Notification.create({
        recipient_id: targetUserId,
        actor_id: req.user.userId,
        type: req.body.action === 'warn_user' ? 'warning' : 'account_status',
        title: req.body.action === 'warn_user' ? 'Moderation warning' : 'Account suspended',
        body: req.body.resolutionNote || 'An administrator reviewed your content.',
        reference_id: flag.target_id,
        reference_type: flag.target_type,
        link: target.question_id ? `/query/${target.question_id}` : null,
      })
    }

    flag.status = status
    flag.reviewed_by = req.user.userId
    flag.reviewed_at = new Date()
    flag.review_action = req.body.action || 'no_action'
    flag.resolution_note = req.body.resolutionNote || ''
    await flag.save()

    await Notification.create({
      recipient_id: flag.reported_by,
      actor_id: req.user.userId,
      type: 'flag_resolved',
      title: 'Report reviewed',
      body: `Your report has been ${status}.`,
      reference_id: flag.target_id,
      reference_type: flag.target_type,
      link: target.question_id ? `/query/${target.question_id}` : null,
    })

    res.json({ success: true, message: 'Flag resolved' })
  } catch (error) {
    next(error)
  }
}

export { flagsWithTargets }
