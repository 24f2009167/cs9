import assert from 'node:assert/strict'
import test from 'node:test'
import Question from '../models/question.model.js'
import FAQQuestion from '../models/faq.model.js'
import { exportQuestionToFAQ } from '../controllers/admin.controller.js'

function makeReq({ questionId = 'q1', body = {} } = {}) {
  return { params: { questionId }, body, user: { userId: 'admin-user-id' } }
}

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

test('exportQuestionToFAQ validation errors for missing title/body', async (t) => {
  let captured
  const res = makeRes()
  await exportQuestionToFAQ(makeReq({ body: {} }), res, (e) => { captured = e })
  assert.equal(captured?.statusCode, 400)
  assert.match(captured?.message, /Curated title is required/)

  captured = null
  await exportQuestionToFAQ(makeReq({ body: { curatedTitle: 'Short' } }), res, (e) => { captured = e })
  assert.equal(captured?.statusCode, 400)
  assert.match(captured?.message, /Title must be at least 10 characters/)
})

test('exportQuestionToFAQ fails if original question is not found', async (t) => {
  t.mock.method(Question, 'findOne', async () => null)

  let captured
  const res = makeRes()
  await exportQuestionToFAQ(
    makeReq({
      body: {
        curatedTitle: 'This is a long curated title',
        curatedBody: 'This is curated body answer text'
      }
    }),
    res,
    (e) => { captured = e }
  )

  assert.equal(captured?.statusCode, 404)
  assert.match(captured?.message, /Original question not found/)
})

test('exportQuestionToFAQ successfully exports and updates original question', async (t) => {
  t.mock.method(Question, 'findOne', async () => ({ question_id: 'q1', title: 'Original Question Title' }))
  
  // mock exists to return false (slug doesn't exist yet)
  t.mock.method(FAQQuestion, 'exists', async () => false)

  // mock FAQQuestion create
  const faqCreate = t.mock.method(FAQQuestion, 'create', async (data) => ({
    question_id: 'faq-new-id',
    ...data
  }))

  // mock Question updateOne
  const questionUpdate = t.mock.method(Question, 'updateOne', async () => ({ modifiedCount: 1 }))

  const res = makeRes()
  await exportQuestionToFAQ(
    makeReq({
      body: {
        curatedTitle: 'This is a long curated title',
        curatedBody: 'This is curated body answer text',
        tags: ['Timing & Dates']
      }
    }),
    res,
    (e) => { throw e }
  )

  assert.equal(res.statusCode, 201)
  assert.equal(res.body.success, true)
  assert.equal(res.body.faq.question_id, 'faq-new-id')
  assert.equal(faqCreate.mock.callCount(), 1)
  assert.equal(questionUpdate.mock.callCount(), 1)
  
  // Check that updateOne was called with correct parameters
  const updateCall = questionUpdate.mock.calls[0]
  assert.deepEqual(updateCall.arguments[0], { question_id: 'q1' })
  assert.deepEqual(updateCall.arguments[1], { $set: { linked_faq_id: 'faq-new-id' } })
})
