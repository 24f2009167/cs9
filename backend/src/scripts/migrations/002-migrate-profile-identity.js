import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../../config/db.js'
import User from '../../models/user.model.js'
import UserProfile from '../../models/user-profile.model.js'

const apply = process.argv.includes('--apply')
const dryRun = !apply

const stats = {
  mode: dryRun ? 'dry-run' : 'apply',
  scanned: 0,
  profilesMissing: 0,
  avatarAlreadyOnProfile: 0,
  wouldCopyAvatar: 0,
  copiedAvatar: 0,
  wouldSetDisplayName: 0,
  setDisplayName: 0,
  wouldUnsetUserAvatar: 0,
  unsetUserAvatar: 0,
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

try {
  await connectDB()

  const cursor = User.collection.find(
    {
      $or: [
        { avatar_url: { $exists: true } },
        { name: { $exists: true } },
      ],
    },
    { projection: { user_id: 1, name: 1, avatar_url: 1 } },
  )

  for await (const user of cursor) {
    stats.scanned += 1

    const profile = await UserProfile.findOne({ user_id: user.user_id }).lean()
    const updates = {}

    if (!profile) {
      stats.profilesMissing += 1
    }

    if (hasText(user.avatar_url)) {
      if (hasText(profile?.avatar_url)) {
        stats.avatarAlreadyOnProfile += 1
      } else {
        updates.avatar_url = user.avatar_url.trim()
        if (dryRun) {
          stats.wouldCopyAvatar += 1
        } else {
          stats.copiedAvatar += 1
        }
      }
    }

    if (!hasText(profile?.display_name) && hasText(user.name)) {
      updates.display_name = user.name.trim()
      if (dryRun) {
        stats.wouldSetDisplayName += 1
      } else {
        stats.setDisplayName += 1
      }
    }

    if (!dryRun && Object.keys(updates).length > 0) {
      await UserProfile.updateOne(
        { user_id: user.user_id },
        { $set: updates, $setOnInsert: { user_id: user.user_id } },
        { upsert: true, runValidators: true },
      )
    }
  }

  const legacyAvatarFilter = { avatar_url: { $exists: true } }

  if (dryRun) {
    stats.wouldUnsetUserAvatar = await User.collection.countDocuments(legacyAvatarFilter)
  } else {
    const result = await User.collection.updateMany(
      legacyAvatarFilter,
      { $unset: { avatar_url: '' } },
    )
    stats.unsetUserAvatar = result.modifiedCount
  }

  console.log(JSON.stringify(stats, null, 2))
} finally {
  await mongoose.disconnect()
}
