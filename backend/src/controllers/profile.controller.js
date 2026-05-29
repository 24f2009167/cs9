import argon2 from 'argon2'
import UserProfile from '../models/user-profile.model.js'
import User from '../models/user.model.js'
import { createHttpError } from '../utils/http.js'
import { validatePassword } from './auth.controller.js'

function toProfile(user, profile) {
  return {
    userId: user.user_id,
    displayName: profile?.display_name || user.name,
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || '',
    expertise: profile?.expertise || [],
    location: profile?.location || '',
    socialLinks: profile?.social_links || {},
    sparkBalance: user.spark_points || 0,
    reputation: profile?.reputation || 0,
  }
}

export async function getMyProfile(req, res, next) {
  try {
    const profile = await UserProfile.findOne({ user_id: req.user.userId })

    res.json({ success: true, profile: toProfile(req.authUser, profile) })
  } catch (error) {
    next(error)
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const updates = {}
    const fields = {
      displayName: 'display_name',
      bio: 'bio',
      avatarUrl: 'avatar_url',
      expertise: 'expertise',
      location: 'location',
      socialLinks: 'social_links',
    }

    for (const [input, stored] of Object.entries(fields)) {
      if (req.body[input] !== undefined) {
        updates[stored] = req.body[input]
      }
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user_id: req.user.userId },
      { $set: updates, $setOnInsert: { user_id: req.user.userId } },
      { new: true, upsert: true, runValidators: true },
    )

    res.json({ success: true, profile: toProfile(req.authUser, profile) })
  } catch (error) {
    next(error)
  }
}

export async function changeMyPassword(req, res, next) {
  try {
    const currentPassword =
      typeof req.body.currentPassword === 'string' ? req.body.currentPassword : ''
    const newPassword =
      typeof req.body.newPassword === 'string' ? req.body.newPassword : ''

    if (!currentPassword || !newPassword) {
      throw createHttpError(400, 'Current and new password are required')
    }

    const user = await User.findOne({ user_id: req.user.userId }).select('+passwordHash')

    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw createHttpError(401, 'Current password is incorrect')
    }

    if (await argon2.verify(user.passwordHash, newPassword)) {
      throw createHttpError(400, 'New password must be different from the current password')
    }

    validatePassword(newPassword)

    user.passwordHash = await argon2.hash(newPassword)
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const [user, profile] = await Promise.all([
      User.findOne({ user_id: req.params.userId }),
      UserProfile.findOne({ user_id: req.params.userId }),
    ])

    if (!user) {
      throw createHttpError(404, 'Profile not found')
    }

    const value = toProfile(user, profile)
    delete value.sparkBalance
    delete value.location
    delete value.socialLinks

    res.json({ success: true, profile: value })
  } catch (error) {
    next(error)
  }
}
