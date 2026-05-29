import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../../config/db.js'
import Answer from '../../models/answer.model.js'
import Comment from '../../models/comment.model.js'
import Question from '../../models/question.model.js'
import Vote from '../../models/vote.model.js'

const apply = process.argv.includes('--apply')
const dryRun = !apply

const targets = [
  {
    type: 'question',
    collection: Question.collection,
    idField: 'question_id',
  },
  {
    type: 'answer',
    collection: Answer.collection,
    idField: 'answer_id',
  },
  {
    type: 'comment',
    collection: Comment.collection,
    idField: 'comment_id',
  },
]

const stats = {
  mode: dryRun ? 'dry-run' : 'apply',
  scannedTargets: 0,
  voterEntries: 0,
  existingVotes: 0,
  wouldInsertVotes: 0,
  insertedVotes: 0,
  insertConflicts: 0,
  wouldUnsetTargets: 0,
  unsetTargets: 0,
  byTargetType: {},
}

function targetStats(targetType) {
  stats.byTargetType[targetType] ||= {
    scannedTargets: 0,
    voterEntries: 0,
    existingVotes: 0,
    wouldInsertVotes: 0,
    insertedVotes: 0,
    insertConflicts: 0,
    wouldUnsetTargets: 0,
    unsetTargets: 0,
  }

  return stats.byTargetType[targetType]
}

async function maybeInsertVote({ userId, targetType, targetId }) {
  const existing = await Vote.exists({
    user_id: userId,
    target_type: targetType,
    target_id: targetId,
  })

  if (existing) {
    stats.existingVotes += 1
    targetStats(targetType).existingVotes += 1
    return
  }

  if (dryRun) {
    stats.wouldInsertVotes += 1
    targetStats(targetType).wouldInsertVotes += 1
    return
  }

  try {
    await Vote.create({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      value: 1,
    })
    stats.insertedVotes += 1
    targetStats(targetType).insertedVotes += 1
  } catch (error) {
    if (error.code === 11000) {
      stats.insertConflicts += 1
      targetStats(targetType).insertConflicts += 1
      return
    }

    throw error
  }
}

try {
  await connectDB()

  for (const target of targets) {
    const perTarget = targetStats(target.type)
    const cursor = target.collection.find(
      { upvoted_by: { $exists: true } },
      { projection: { [target.idField]: 1, upvoted_by: 1 } },
    )

    for await (const document of cursor) {
      stats.scannedTargets += 1
      perTarget.scannedTargets += 1
      const targetId = document[target.idField]
      const voterIds = Array.isArray(document.upvoted_by)
        ? [...new Set(document.upvoted_by.filter(Boolean))]
        : []

      for (const userId of voterIds) {
        stats.voterEntries += 1
        perTarget.voterEntries += 1
        await maybeInsertVote({
          userId,
          targetType: target.type,
          targetId,
        })
      }
    }

    const unsetFilter = { upvoted_by: { $exists: true } }

    if (dryRun) {
      const count = await target.collection.countDocuments(unsetFilter)
      stats.wouldUnsetTargets += count
      perTarget.wouldUnsetTargets += count
    } else {
      const result = await target.collection.updateMany(
        unsetFilter,
        { $unset: { upvoted_by: '' } },
      )
      stats.unsetTargets += result.modifiedCount
      perTarget.unsetTargets += result.modifiedCount
    }
  }

  console.log(JSON.stringify(stats, null, 2))
} finally {
  await mongoose.disconnect()
}
