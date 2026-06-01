/**
 * Normalize all question.tags to lowercase.
 * Also runs 007-backfill-tags as part of the same session.
 *
 * Usage:
 *   node scripts/normalize-question-tags.js
 */

import 'dotenv/config'
import connectDB from '../config/db.js'
import Question from '../models/question.model.js'
import Tag from '../models/tag.model.js'

await connectDB()

console.log('Normalizing question.tags to lowercase…')
const questions = await Question.find({}, { tags: 1 }).lean()

let normalizedCount = 0
for (const q of questions) {
  const normalized = (q.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean)
  if (JSON.stringify(q.tags) !== JSON.stringify(normalized)) {
    await Question.updateOne({ _id: q._id }, { $set: { tags: normalized } })
    normalizedCount++
  }
}
console.log(`Normalized ${normalizedCount} questions.`)

// Now backfill tags
console.log('\nBackfilling Tag collection…')
const tagMap = new Map()
for (const q of await Question.find({}, { tags: 1 }).lean()) {
  for (const t of q.tags || []) {
    tagMap.set(t, (tagMap.get(t) || 0) + 1)
  }
}

const ops = []
for (const [name, count] of tagMap) {
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  ops.push({
    updateOne: {
      filter: { name },
      update: { $set: { name, displayName, questionCount: count } },
      upsert: true,
    },
  })
}

const result = await Tag.bulkWrite(ops)
console.log(`Tags upserted: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`)

// Verify
const tags = await Tag.find({}).sort({ questionCount: -1 }).lean()
console.log('\nCurrent tags:')
for (const t of tags) {
  console.log(`  ${t.displayName.padEnd(20)} (${t.name})  count=${t.questionCount}`)
}

console.log('\nDone.')
process.exit(0)