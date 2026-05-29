import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

/**
 * answers
 *
 * One collection serves both FAQ and community questions.
 * The parent's `kind` is denormalized onto the answer (`question_kind`) so
 * you can filter/aggregate by surface without a $lookup.
 */

const sparkAwardSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    awarded_at: { type: Date, default: null },
    // transaction_id references the SparkTransaction UUID
    transaction_id: { type: String, default: null },
  },
  { _id: false },
)

const editHistorySchema = new mongoose.Schema(
  {
    edited_by: { type: String, required: true },  // user_id
    edited_at: { type: Date, default: Date.now },
    previous_body: { type: String },
  },
  { _id: false },
)

const answerSchema = new mongoose.Schema(
  {
    answer_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },

    question_id: {
      type: String,
      required: true,
      index: true,
    },

    // Denormalized kind from parent question. Lets you badge answers as
    // "FAQ Answer" vs "Community Answer" without a join.
    question_kind: {
      type: String,
      enum: ['faq', 'community'],
      default: 'community',
    },

    author_id: {
      type: String,
      required: true,
      index: true,
    },

    // Snapshot of the author's role at posting time — stable even if the
    // user's role changes later. Drives "Answered by RESOLVER" badges.
    author_role: {
      type: String,
      enum: ['USER', 'RESOLVER', 'ADMIN'],
      default: 'USER',
    },

    body: {
      type: String,
      required: true,
      minlength: 20,
    },

    // Stripped, search-friendly version of body. Populate in a pre-save hook.
    body_plain: {
      type: String,
      default: '',
    },

    references: [{ url: String, label: String }],
    attachments: [{ file_url: String, file_name: String, mime_type: String }],

    is_expert: {
      type: Boolean,
      default: false,
    },
    expert_type: String,
    specialty: String,

    // Mirrors questions.accepted_answer_id. Denormalized so answers can be
    // sorted accepted-first without a separate lookup.
    is_accepted: {
      type: Boolean,
      default: false,
    },

    // Marks the canonical answer shown by default on an FAQ question.
    is_official: {
      type: Boolean,
      default: false,
    },

    // Soft delete flag (legacy). Prefer `visibility` for new code.
    is_deleted: {
      type: Boolean,
      default: false,
    },

    // Granular visibility independent of moderation status.
    visibility: {
      type: String,
      enum: ['public', 'hidden', 'deleted'],
      default: 'public',
    },

    upvotes: {
      type: Number,
      default: 0,
    },
    upvoted_by: [String],

    downvotes: {
      type: Number,
      default: 0,
    },

    // Denormalized score (upvotes - downvotes). Used for cheap sorted queries.
    score: {
      type: Number,
      default: 0,
      index: true,
    },

    comment_count: {
      type: Number,
      default: 0,
    },
    top_level_comment_count: {
      type: Number,
      default: 0,
    },

    // Populated when this answer won a spark bounty.
    spark_award: {
      type: sparkAwardSchema,
      default: () => ({}),
    },

    moderation_status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
    moderated_by: String,
    moderated_at: Date,
    moderation_reason: String,
    removal_reason: String,

    edit_history: {
      type: [editHistorySchema],
      default: [],
    },
  },
  {
    collection: 'answers',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

// Primary read path: question detail page.
// Sort accepted-first, then by score, then chronologically.
answerSchema.index({ question_id: 1, is_accepted: -1, score: -1, created_at: 1 })
answerSchema.index({ question_id: 1, is_official: 1 })
answerSchema.index({ question_id: 1, created_at: -1 })

export default mongoose.model('Answer', answerSchema)
