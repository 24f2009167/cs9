import 'dotenv/config'
import argon2 from 'argon2'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import UserRoleMapper from '../models/user-role-mapper.model.js'
import User from '../models/user.model.js'
import { ensureRole } from '../services/role.service.js'

const email = typeof process.env.ADMIN_EMAIL === 'string'
  ? process.env.ADMIN_EMAIL.trim().toLowerCase()
  : ''
const name = process.env.ADMIN_NAME || 'Portal Admin'
const password = process.env.ADMIN_PASSWORD || ''

if (!email) {
  throw new Error('Set ADMIN_EMAIL before running the admin seed command')
}

try {
  await connectDB()

  const [, , adminRole] = await Promise.all(
    ['USER', 'RESOLVER', 'ADMIN'].map((role) => ensureRole(role)),
  )
  let user = await User.findOne({ email })

  if (!user) {
    if (password.length < 8) {
      throw new Error('Set ADMIN_PASSWORD to at least 8 characters to create an admin')
    }

    user = await User.create({
      name,
      email,
      passwordHash: await argon2.hash(password),
      role: 'ADMIN',
      status: 'active',
    })
  } else {
    await User.updateOne(
      { user_id: user.user_id },
      { $set: { role: 'ADMIN', status: 'active' } },
    )
  }

  await UserRoleMapper.updateOne(
    { user_id: user.user_id, role_id: adminRole.role_id },
    { $setOnInsert: { user_id: user.user_id, role_id: adminRole.role_id } },
    { upsert: true },
  )

  console.log(`Admin role ready for ${user.email}`)
} finally {
  await mongoose.disconnect()
}
