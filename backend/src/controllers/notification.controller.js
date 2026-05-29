import Notification from '../models/notification.model.js'
import {
  createHttpError,
  getPagination,
  paginationResult,
} from '../utils/http.js'

export async function listNotifications(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = { recipient_id: req.user.userId }

    if (req.query.read !== undefined) {
      if (!['true', 'false'].includes(req.query.read)) {
        throw createHttpError(400, 'Read must be true or false')
      }
      filter.is_read = req.query.read === 'true'
    }
    if (req.query.type) {
      filter.type = req.query.type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient_id: req.user.userId, is_read: false }),
    ])

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        notification_id: req.params.notificationId,
        recipient_id: req.user.userId,
      },
      { $set: { is_read: true } },
      { new: true },
    )

    if (!notification) {
      throw createHttpError(404, 'Notification not found')
    }

    res.json({ success: true, message: 'Notification marked as read' })
  } catch (error) {
    next(error)
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      { recipient_id: req.user.userId, is_read: false },
      { $set: { is_read: true } },
    )

    res.json({ success: true, updatedCount: result.modifiedCount })
  } catch (error) {
    next(error)
  }
}
