/**
 * 007-backfill-tags.js
 * Upserts all unique tags from the Question collection into the Tag collection,
 * computing questionCount for each. Sets displayName = Title Case of name.
 * Safe to re-run — uses upsert.
 *
 * Usage:
 *   node scripts/migrations/007-backfill-tags.js
 */

import 'dotenv/config'
import connectDB from '../../config/db.js'
import Question from '../../models/question.model.js'
import Tag from '../../models/tag.model.js'

await connectDB()

console.log('Collecting tags from all questions…')
const questions = await Question.find({}, { tags: 1 }).lean()

const tagMap = new Map()
for (const q of questions) {
  for (const t of q.tags || []) {
    // Tags stored lowercase in questions — normalize to lowercase
    const name = String(t).toLowerCase().trim()
    if (!name) continue
    tagMap.set(name, (tagMap.get(name) || 0) + 1)
  }
}

console.log(`Found ${tagMap.size} unique tags across ${questions.length} questions.`)

if (tagMap.size === 0) {
  console.log('Nothing to backfill. Exiting.')
  process.exit(0)
}

// Upsert each tag
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
console.log(`Upserted: ${result.upsertedCount} | Modified: ${result.modifiedCount}`)

console.log('\nDone — all tags are lowercase in DB, displayName is Title Case.')
process.exit(0)