import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

const userRoleMapperSchema = new mongoose.Schema(
  {
    user_role_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: [true, 'User id is required'],
      index: true,
    },
    role_id: {
      type: String,
      required: [true, 'Role id is required'],
      index: true,
    },
  },
  {
    collection: 'user_role_mappers',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

userRoleMapperSchema.index({ user_id: 1, role_id: 1 }, { unique: true })

export default mongoose.model('UserRoleMapper', userRoleMapperSchema)
