import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

/**
 * comments
 *
 * Threaded comments on answers (depth 0 = direct reply to an answer,
 * depth 1 = reply to a comment). Depth is capped at 1 in application logic.
 *
 * question_id is denormalized so moderation views can fetch "all comments
 * on this question" in a single indexed query without a $lookup.
 */

const editHistorySchema = new mongoose.Schema(
  {
    edited_by: { type: String, required: true },  // user_id
    edited_at: { type: Date, default: Date.now },
    previous_body: { type: String },
  },
  { _id: false },
)

const commentSchema = new mongoose.Schema(
  {
    comment_id: {
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

    answer_id: {
      type: String,
      required: true,
      index: true,
    },

    // null = top-level comment on the answer
    parent_id: {
      type: String,
      default: null,
      index: true,
    },

    // The top-level comment this thread belongs to. Lets you fetch a whole
    // sub-thread in one indexed query.
    root_comment_id: {
      type: String,
      default: null,
    },

    // 0 = direct reply to answer, 1 = reply to comment. Cap at 1.
    depth: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    author_id: {
      type: String,
      required: true,
      index: true,
    },

    // Snapshot of the author's role at posting time.
    author_role: {
      type: String,
      enum: ['USER', 'RESOLVER', 'ADMIN'],
      default: 'USER',
    },

    body: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // User IDs @-mentioned in the comment. Drives notification fan-out.
    mentions: [String],

    upvotes: {
      type: Number,
      default: 0,
    },
    upvoted_by: [String],

    downvotes: {
      type: Number,
      default: 0,
    },

    // Denormalized score (upvotes - downvotes) for cheap sorted queries.
    score: {
      type: Number,
      default: 0,
    },

    reply_count: {
      type: Number,
      default: 0,
    },

    flag_count: {
      type: Number,
      default: 0,
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

    moderation_status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
    moderated_by: String,
    moderated_at: Date,
    moderation_reason: String,

    edit_history: {
      type: [editHistorySchema],
      default: [],
    },
  },
  {
    collection: 'comments',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

// Load an answer's thread top-down.
commentSchema.index({ answer_id: 1, parent_id: 1, created_at: 1 })

// Load an entire sub-thread.
commentSchema.index({ root_comment_id: 1, depth: 1, created_at: 1 })

export default mongoose.model('Comment', commentSchema)
