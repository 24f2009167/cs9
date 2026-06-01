import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    questionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

tagSchema.index({ questionCount: -1 })

export default mongoose.model('Tag', tagSchema)