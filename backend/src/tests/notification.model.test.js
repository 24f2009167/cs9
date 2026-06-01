import assert from 'node:assert/strict'
import test from 'node:test'
import Notification from '../models/notification.model.js'

test('notification schema accepts moderation content-hidden notifications', () => {
  const notification = new Notification({
    recipient_id: 'user-1',
    type: 'content_hidden',
    title: 'Content hidden',
    body: 'Your content was hidden after moderation review.',
    reference_id: 'answer-1',
    reference_type: 'answer',
  })

  assert.doesNotThrow(() => notification.validateSync())
})
