import Answer from '../models/answer.model.js'
import SparkTransaction from '../models/spark-transaction.model.js'
import UserProfile from '../models/user-profile.model.js'
import User from '../models/user.model.js'
import { getUserIdsByRole } from '../services/role.service.js'
import {
  createHttpError,
  getCreatedAtFilter,
  getPagination,
  paginationResult,
} from '../utils/http.js'

async function getDisplayNameByUserId(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))]

  if (!ids.length) {
    return {}
  }

  const [users, profiles] = await Promise.all([
    User.find({ user_id: { $in: ids } }).select('user_id name').lean(),
    UserProfile.find({ user_id: { $in: ids } }).select('user_id display_name').lean(),
  ])
  const displayNameById = Object.fromEntries(users.map((user) => [user.user_id, user.name]))

  for (const profile of profiles) {
    if (profile.display_name) {
      displayNameById[profile.user_id] = profile.display_name
    }
  }

  return displayNameById
}

export async function getSparkBalance(req, res, next) {
  try {
    const profile = await UserProfile.findOne({ user_id: req.user.userId })

    res.json({
      success: true,
      sparkBalance: req.authUser.spark_points || 0,
      reputation: profile?.reputation || 0,
    })
  } catch (error) {
    next(error)
  }
}

export async function listSparkTransactions(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = { user_id: req.user.userId }
    const createdAt = getCreatedAtFilter(req.query.from, req.query.to)

    if (req.query.type) {
      filter.action = req.query.type
    }
    if (createdAt) {
      filter.created_at = createdAt
    }

    const [transactions, total] = await Promise.all([
      SparkTransaction.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      SparkTransaction.countDocuments(filter),
    ])

    res.json({
      success: true,
      transactions,
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function getLeaderboard(req, res, next) {
  try {
    const { limit } = getPagination({ page: 1, limit: req.query.limit || 20 })
    const type = req.query.type || 'reputation'
    const role = req.query.role ? String(req.query.role).toUpperCase() : undefined

    if (!['reputation', 'spark', 'acceptedAnswers'].includes(type)) {
      throw createHttpError(400, 'Invalid leaderboard type')
    }
    if (role && !['USER', 'RESOLVER', 'ADMIN'].includes(role)) {
      throw createHttpError(400, 'Invalid role')
    }

    const roleUserIds = role ? await getUserIdsByRole(role) : null
    const userFilter = roleUserIds ? { user_id: { $in: roleUserIds } } : {}
    let leaderboard

    if (type === 'acceptedAnswers') {
      const acceptedAnswersMatch = roleUserIds
        ? { is_accepted: true, is_deleted: { $ne: true }, author_id: { $in: roleUserIds } }
        : { is_accepted: true, is_deleted: { $ne: true } }

      const rows = await Answer.aggregate([
        { $match: acceptedAnswersMatch },
        { $group: { _id: '$author_id', score: { $sum: 1 } } },
        { $sort: { score: -1 } },
        { $limit: limit },
      ])
      const candidateUserIds = rows.map((row) => row._id)
      const users = await User.find({
        user_id: { $in: candidateUserIds },
      }).lean()
      const byId = Object.fromEntries(users.map((user) => [user.user_id, user]))
      const displayNameById = await getDisplayNameByUserId(users.map((user) => user.user_id))

      leaderboard = rows
        .filter((row) => byId[row._id])
        .slice(0, limit)
        .map((row) => ({
          userId: row._id,
          displayName: displayNameById[row._id] || byId[row._id].name,
          score: row.score,
        }))
    } else if (type === 'reputation') {
      const profileFilter = roleUserIds ? { user_id: { $in: roleUserIds } } : {}
      const profiles = await UserProfile.find(profileFilter).sort({ reputation: -1 }).limit(limit).lean()
      const candidateUserIds = profiles.map((profile) => profile.user_id)
      const users = await User.find({
        user_id: { $in: candidateUserIds },
      }).lean()
      const byId = Object.fromEntries(users.map((user) => [user.user_id, user]))

      leaderboard = profiles
        .filter((profile) => byId[profile.user_id])
        .slice(0, limit)
        .map((profile) => ({
          userId: profile.user_id,
          displayName: profile.display_name || byId[profile.user_id].name,
          score: profile.reputation || 0,
        }))
    } else {
      const users = await User.find(userFilter).sort({ spark_points: -1 }).limit(limit).lean()
      const displayNameById = await getDisplayNameByUserId(users.map((user) => user.user_id))
      leaderboard = users.map((user) => ({
        userId: user.user_id,
        displayName: displayNameById[user.user_id] || user.name,
        score: user.spark_points || 0,
      }))
    }

    res.json({ success: true, leaderboard })
  } catch (error) {
    next(error)
  }
}
