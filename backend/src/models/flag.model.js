import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

const flagSchema = new mongoose.Schema(
  {
    flag_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },
    target_type: {
      type: String,
      enum: ['question', 'answer', 'comment'],
      required: true,
    },
    target_id: {
      type: String,
      required: true,
    },
    reported_by: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewed_by: String,
    reviewed_at: Date,
    review_action: String,
    resolution_note: String,
  },
  {
    collection: 'flags',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

flagSchema.index({ target_type: 1, target_id: 1, reported_by: 1 }, { unique: true })
flagSchema.index({ status: 1, created_at: -1 })

export default mongoose.model('Flag', flagSchema)
