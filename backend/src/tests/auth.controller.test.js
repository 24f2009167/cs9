import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePassword } from '../controllers/auth.controller.js'

test('validatePassword accepts passwords that meet strength requirements', () => {
  assert.doesNotThrow(() => validatePassword('GoodPass1'))
  assert.doesNotThrow(() => validatePassword('lowercase1!'))
})

test('validatePassword rejects weak passwords with actionable errors', () => {
  assert.throws(
    () => validatePassword('short'),
    /Password is too weak/,
  )
  assert.throws(
    () => validatePassword(null),
    /Password must be a string/,
  )
})
