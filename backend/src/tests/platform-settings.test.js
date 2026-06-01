import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_PLATFORM_SETTINGS,
  mergeAndSanitizePlatformSettingsSection,
} from '../services/platform-settings.service.js'

test('leaderboard settings are merged and coerced to numbers', () => {
  const next = mergeAndSanitizePlatformSettingsSection(
    'leaderboard',
    DEFAULT_PLATFORM_SETTINGS.leaderboard,
    { answersGivenWeight: '2.5', warningPenaltyWeight: 3 },
  )

  assert.equal(next.answersGivenWeight, 2.5)
  assert.equal(next.warningPenaltyWeight, 3)
  assert.equal(next.reputationWeight, 1)
})

test('settings reject invalid numeric values', () => {
  assert.throws(
    () => mergeAndSanitizePlatformSettingsSection(
      'leaderboard',
      DEFAULT_PLATFORM_SETTINGS.leaderboard,
      { questionsAskedWeight: -1 },
    ),
    /questionsAskedWeight must be at least 0/,
  )
})

test('question escalation reminder cannot exceed escalation time', () => {
  assert.throws(
    () => mergeAndSanitizePlatformSettingsSection(
      'questionEscalation',
      DEFAULT_PLATFORM_SETTINGS.questionEscalation,
      {
        unresolvedHoursToEscalate: 24,
        reminderHoursBeforeEscalation: 48,
      },
    ),
    /reminderHoursBeforeEscalation must not exceed unresolvedHoursToEscalate/,
  )
})

test('default admin escalation strategy requires valid booleans and strategy enum', () => {
  const next = mergeAndSanitizePlatformSettingsSection(
    'questionEscalation',
    DEFAULT_PLATFORM_SETTINGS.questionEscalation,
    {
      automaticEscalationEnabled: true,
      includeCommentedUnresolved: true,
      assignmentStrategy: 'round_robin_admin',
    },
  )

  assert.equal(next.automaticEscalationEnabled, true)
  assert.equal(next.assignmentStrategy, 'round_robin_admin')
})
