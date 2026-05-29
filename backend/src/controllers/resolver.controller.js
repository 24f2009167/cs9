import Answer from '../models/answer.model.js'
import Question from '../models/question.model.js'
import SparkTransaction from '../models/spark-transaction.model.js'
import UserProfile from '../models/user-profile.model.js'
import {
  createHttpError,
  getCreatedAtFilter,
  getPagination,
  paginationResult,
} from '../utils/http.js'

export async function getResolverQueue(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = { moderation_status: 'approved' }

    if (req.query.category) {
      filter.category = req.query.category
    }
    if (req.query.tag) {
      filter.tags = req.query.tag
    }
    if (req.query.unanswered !== 'false') {
      filter.status = 'unanswered'
    } else {
      filter.status = { $ne: 'removed' }
    }

    const sort =
      req.query.sort === 'newest'
        ? { created_at: -1 }
        : { spark_bounty: -1, created_at: -1 }
    const [questions, total] = await Promise.all([
      Question.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Question.countDocuments(filter),
    ])

    res.json({
      success: true,
      questions,
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function getResolverStats(req, res, next) {
  try {
    const createdAt = getCreatedAtFilter(req.query.from, req.query.to)
    const filter = { author_id: req.user.userId, ...(createdAt && { created_at: createdAt }) }
    const sparkFilter = {
      user_id: req.user.userId,
      ...(createdAt && { created_at: createdAt }),
    }

    const [answersCount, acceptedAnswersCount, spark, profile] = await Promise.all([
      Answer.countDocuments(filter),
      Answer.countDocuments({ ...filter, is_accepted: true }),
      SparkTransaction.aggregate([
        { $match: sparkFilter },
        { $group: { _id: null, total: { $sum: '$points' } } },
      ]),
      UserProfile.findOne({ user_id: req.user.userId }),
    ])

    res.json({
      success: true,
      stats: {
        answersCount,
        acceptedAnswersCount,
        acceptanceRate: answersCount ? acceptedAnswersCount / answersCount : 0,
        sparkEarned: spark[0]?.total || 0,
        reputation: profile?.reputation || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function updateResolverExpertise(req, res, next) {
  try {
    const updates = {}

    for (const field of ['expertise', 'categories', 'tags']) {
      if (req.body[field] !== undefined) {
        if (!Array.isArray(req.body[field])) {
          throw createHttpError(400, `${field} must be an array`)
        }
        updates[field] = req.body[field]
      }
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user_id: req.user.userId },
      { $set: updates, $setOnInsert: { user_id: req.user.userId } },
      { upsert: true, new: true, runValidators: true },
    )

    res.json({ success: true, profile })
  } catch (error) {
    next(error)
  }
}
