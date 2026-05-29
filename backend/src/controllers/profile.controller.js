import UserProfile from '../models/user-profile.model.js'
import User from '../models/user.model.js'
import { createHttpError } from '../utils/http.js'

function toProfile(user, profile) {
  return {
    userId: user.user_id,
    displayName: profile?.display_name || user.name,
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || user.avatar_url || '',
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

    if (req.body.avatarUrl !== undefined) {
      req.authUser.avatar_url = req.body.avatarUrl
      await req.authUser.save()
    }

    res.json({ success: true, profile: toProfile(req.authUser, profile) })
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
