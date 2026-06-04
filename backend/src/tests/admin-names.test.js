import assert from 'node:assert/strict'
import test from 'node:test'
import User from '../models/user.model.js'
import UserProfile from '../models/user-profile.model.js'
import Question from '../models/question.model.js'
import { flagsWithTargets } from '../controllers/flag.controller.js'
import { applyModerationAction } from '../services/content.service.js'

test('flagsWithTargets retrieves display name from UserProfile over User name', async (t) => {
  // Mock Question.findOne for findContentTarget
  t.mock.method(Question, 'findOne', () => {
    const doc = {
      question_id: 'q-123',
      author_id: 'author-123',
    }
    doc.lean = () => Promise.resolve(doc)
    return doc
  })

  // Mock User.findOne to return reporter name and author name
  let userFindCount = 0
  t.mock.method(User, 'findOne', (query) => {
    userFindCount++
    const userId = query.user_id
    return {
      select(fields) {
        return {
          lean() {
            if (userId === 'reporter-123') {
              return Promise.resolve({ user_id: 'reporter-123', name: 'Real Reporter' })
            }
            if (userId === 'author-123') {
              return Promise.resolve({ user_id: 'author-123', name: 'Real Author' })
            }
            return Promise.resolve(null)
          }
        }
      }
    }
  })

  // Mock UserProfile.findOne to return display names
  let profileFindCount = 0
  t.mock.method(UserProfile, 'findOne', (query) => {
    profileFindCount++
    const userId = query.user_id
    return {
      select(fields) {
        return {
          lean() {
            if (userId === 'reporter-123') {
              return Promise.resolve({ user_id: 'reporter-123', display_name: 'Display Reporter' })
            }
            if (userId === 'author-123') {
              return Promise.resolve({ user_id: 'author-123', display_name: 'Display Author' })
            }
            return Promise.resolve(null)
          }
        }
      }
    }
  })

  const flags = [
    {
      flag_id: 'f-1',
      target_type: 'question',
      target_id: 'q-123',
      reported_by: 'reporter-123',
      reason: 'inappropriate',
      status: 'pending',
    }
  ]

  const result = await flagsWithTargets(flags)

  assert.equal(result.length, 1)
  assert.equal(result[0].reported_by_name, 'Display Reporter')
  assert.equal(result[0].author_name, 'Display Author')
  assert.equal(userFindCount, 2)
  assert.equal(profileFindCount, 2)
})

test('applyModerationAction with action hide sets moderation_status to rejected and status to removed for question', async (t) => {
  const findOneAndUpdateMock = t.mock.method(Question, 'findOneAndUpdate', async (query, update) => {
    return {
      question_id: 'q-123',
      ...update.$set,
    }
  })

  const result = await applyModerationAction({
    targetType: 'question',
    targetId: 'q-123',
    action: 'hide',
    adminId: 'admin-123',
    reason: 'inappropriate',
  })

  assert.equal(result.moderation_status, 'rejected')
  assert.equal(result.status, 'removed')
  assert.equal(result.moderated_by, 'admin-123')
  assert.equal(result.moderation_reason, 'inappropriate')
  assert.equal(findOneAndUpdateMock.mock.callCount(), 1)
})
