/**
 * Backfill `link` for existing notifications that were created without it.
 *
 * Reconstructs the link from reference_id + reference_type:
 *   - reference_type = 'question'  →  /query/{reference_id}
 *   - reference_type = 'answer'    →  /query/{answer.question_id}  (needs lookup)
 *   - reference_type = 'comment'   →  /query/{answer.question_id}  (needs lookup)
 *   - reference_type = 'user'      →  null  (no question to link to)
 *
 * Run once:  node src/scripts/backfill-notification-links.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import Notification from '../models/notification.model.js'
import Question from '../models/question.model.js'
import Answer from '../models/answer.model.js'

const { MONGO_URL } = process.env
if (!MONGO_URL) {
  console.error('MONGO_URL not set in environment')
  process.exit(1)
}

await mongoose.connect(MONGO_URL)

async function getQuestionIdForAnswer(answerId) {
  const answer = await Answer.findOne({ answer_id: answerId }).select('question_id').lean()
  return answer?.question_id ?? null
}

async function buildLink(n) {
  if (!n.reference_id || !n.reference_type) return null
  if (n.reference_type === 'question') {
    return `/query/${n.reference_id}`
  }
  if (n.reference_type === 'answer' || n.reference_type === 'comment') {
    const questionId = await getQuestionIdForAnswer(n.reference_id)
    return questionId ? `/query/${questionId}` : null
  }
  return null
}

async function backfill() {
  // Find all notifications without a link field (or with null/empty link)
  const notifications = await Notification.find({
    $or: [
      { link: { $exists: false } },
      { link: null },
      { link: '' },
    ],
  }).lean()

  console.log(`Found ${notifications.length} notifications needing link backfill`)

  let updated = 0
  for (const n of notifications) {
    const link = await buildLink(n)
    if (!link) {
      console.log(`  Skipping ${n.notification_id}: no resolvable link (type=${n.type}, ref=${n.reference_id})`)
      continue
    }
    await Notification.updateOne(
      { notification_id: n.notification_id },
      { $set: { link } },
    )
    updated++
    process.stdout.write(`\r  Updated: ${updated}`)
  }

  console.log(`\nDone. ${updated} notifications updated.`)
  await mongoose.disconnect()
  process.exit(0)
}

backfill().catch(async err => {
  console.error('\nError:', err)
  await mongoose.disconnect()
  process.exit(1)
})