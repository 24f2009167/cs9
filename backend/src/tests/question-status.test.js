import assert from 'node:assert/strict'
import test from 'node:test'
import { getQuestionStatusFilter } from '../controllers/question.controller.js'

test('resolved question filter only includes finally closed questions', () => {
  assert.equal(getQuestionStatusFilter('resolved'), 'closed')
})

test('open question filter includes unanswered and answered-but-unresolved questions', () => {
  assert.deepEqual(getQuestionStatusFilter('open'), { $in: ['unanswered', 'answered'] })
})
