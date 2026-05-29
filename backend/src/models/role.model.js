import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema(
  {
    role_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  {
    collection: 'roles',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model('Role', roleSchema)
