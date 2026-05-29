/**
 * Ingest samagama-faq-qn.txt into the Question collection.
 * Each entry has a section header, Q line, A line, and a separator.
 *
 * Usage: node src/scripts/ingest-faqs.js
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import connectDB from '../config/db.js'
import Question from '../models/question.model.js'
import User from '../models/user.model.js'

const SECTION_SEP = /─{20,}/

const TXT = readFileSync(
  new URL('../../../samagama-faq-qn.txt', import.meta.url),
  'utf8',
)

/** Strip the leading "Qn: X.Y " or "Qn: " prefix from question text */
function parseQn(raw) {
  const m = raw.match(/^Q?\d+[:.)]?\s*(.+)/s)
  return m ? m[1].trim() : raw.trim()
}

/** Strip the leading "A: " prefix from answer text */
function parseAn(raw) {
  const m = raw.match(/^A:\s*(\S[\s\S]*)/s)
  return m ? m[1].trim() : raw.trim()
}

/**
 * Extract section title from the header line between Qn: and A:
 * e.g. "Q1: 1.1 What is the Vicharanashala internship?"
 * → { section: "1.1", question: "What is the Vicharanashala internship?" }
 */
function parseHeader(line) {
  const m = line.match(/^Q?\d+[:.)]\s*(\d+\.\d+)?\s*(.+)/)
  if (!m) return { section: 'General', question: line }
  return { section: m[1] || 'General', question: m[2].trim() }
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@iitr.ac.in').trim().toLowerCase()

async function main() {
  await connectDB()

  // Get admin as author for all FAQs
  const admin = await User.findOne({ email: ADMIN_EMAIL })
  if (!admin) {
    throw new Error(`Admin user ${ADMIN_EMAIL} not found — run seed-admin first`)
  }

  // Split on the Unicode box-drawing separator used throughout the file
  const rawBlocks = TXT.split(SECTION_SEP).map((b) => b.trim()).filter(Boolean)

  let ingested = 0
  let skipped = 0
  const errors = []

  for (const block of rawBlocks) {
    const lines = block.split('\n').map((l) => l.trim())

    // First non-empty line is the question header
    const qLine = lines.find((l) => l.length > 0 && /^Q/i.test(l))
    if (!qLine) { skipped++; continue }

    // First line after Q line (may be on same line as "A:" or next line)
    const qTextRaw = parseQn(qLine)
    const { section } = parseHeader(qLine)

    // Find answer — look for "A:" on same or subsequent lines
    const aIdx = lines.findIndex((l) => /^A\s*:\s*/.test(l))
    if (aIdx === -1) { skipped++; continue }

    const aLine = lines[aIdx]
    const answerRaw = parseAn(aLine)

    // Merge any continuation lines that belong to the answer
    const answerCont = lines.slice(aIdx + 1).join(' ').trim()

    // Collapse multiple whitespace and line-break artifacts
    const answer = (answerRaw + (answerCont ? ' ' + answerCont : ''))
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (answer.length < 10) { skipped++; continue }

    try {
      await Question.create({
        question_id: randomUUID(),
        kind: 'faq',
        title: qTextRaw,
        body: answer,
        body_plain: answer,
        category: section,
        tags: ['VINS', 'internship', 'faq'],
        author_id: admin.user_id,
        status: 'published',
        visibility: 'public',
        upvotes: 0,
        view_count: 0,
        answer_count: 0,
      })
      ingested++
      process.stdout.write(`✓ Q${ingested}: ${section} — ${qTextRaw.slice(0, 60)}…\n`)
    } catch (err) {
      errors.push({ section, question: qTextRaw, error: err.message })
    }
  }

  console.log(`\nDone. Ingested: ${ingested}  Skipped: ${skipped}  Errors: ${errors.length}`)
  if (errors.length) {
    errors.forEach((e) => console.error(`  ✗ ${e.section} — ${e.question}: ${e.error}`))
  }

  await import('mongoose').then((m) => m.default.disconnect())
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})