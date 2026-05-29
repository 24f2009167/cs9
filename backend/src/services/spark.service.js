import SparkTransaction from '../models/spark-transaction.model.js'
import User from '../models/user.model.js'
import { createHttpError } from '../utils/http.js'

export const SPARK_POINTS = {
  SUBMIT_QUESTION: 2,
  SUBMIT_ANSWER: 5,
  ANSWER_UPVOTED: 3,
  ANSWER_ACCEPTED: 15,
  ADD_REFERENCE: 5,
  DAILY_LOGIN: 1,
  EXPERT_VERIFIED: 20,
  QUESTION_BOUNTY: null,   // negative, set dynamically in reserveBounty
  BOUNTY_AWARDED: null,    // positive, set dynamically from question.spark_bounty
}

export async function awardSpark({
  userId,
  action,
  referenceId,
  referenceType,
  points = SPARK_POINTS[action],
}) {
  if (typeof points !== 'number') {
    throw new Error(`Unknown spark action: ${action}`)
  }

  const transaction = await SparkTransaction.create({
    user_id: userId,
    action,
    points,
    reference_id: referenceId,
    reference_type: referenceType,
  })

  await User.updateOne({ user_id: userId }, { $inc: { spark_points: points } })
  return transaction
}

export async function reserveBounty(userId, points, questionId) {
  if (points === 0) {
    return
  }

  const user = await User.findOneAndUpdate(
    { user_id: userId, spark_points: { $gte: points } },
    { $inc: { spark_points: -points } },
    { new: true },
  )

  if (!user) {
    throw createHttpError(403, 'Insufficient spark balance')
  }

  await SparkTransaction.create({
    user_id: userId,
    action: 'QUESTION_BOUNTY',
    points: -points,
    reference_id: questionId,
    reference_type: 'question',
  })
}
