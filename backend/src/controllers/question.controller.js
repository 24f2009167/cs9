import Answer from '../models/answer.model.js'
import Comment from '../models/comment.model.js'
import Notification from '../models/notification.model.js'
import Question from '../models/question.model.js'
import { awardSpark, reserveBounty } from '../services/spark.service.js'
import {
  createHttpError,
  escapeRegex,
  getPagination,
  paginationResult,
} from '../utils/http.js'

const SECTION_LABELS = {
  '1': 'VINS Overview',
  '2': 'Timeline & Start Dates',
  '3': 'NOC & Onboarding',
  '4': 'Selection & Offer',
  '5': 'Internship Work',
  '6': 'Communication',
  '7': 'Interview Issues',
  '8': 'Certificate & Completion',
  '9': 'Rosetta Journal',
  '10': 'Coursework & Exemptions',
  '11': 'Platform & Login',
  '12': 'ViBe Platform',
  '13': 'Team Formation',
}

export async function listPublishedFAQs(req, res, next) {
  try {
    const faqs = await Question.find({
      kind: 'faq',
      status: 'published',
    })
      .sort({ category: 1, title: 1 })
      .lean()

    const grouped = {}
    for (const faq of faqs) {
      const raw = faq.category || 'General'
      const major = raw.split('.')[0]
      const label = SECTION_LABELS[major] || SECTION_LABELS[raw] || raw

      if (!grouped[label]) grouped[label] = []
      grouped[label].push({
        id: faq.question_id,
        question: faq.title,
        answer: faq.body,
        category: label,
        tags: faq.tags || [],
        updatedAt: faq.updated_at,
      })
    }

    res.json({ success: true, faqs: grouped, total: faqs.length })
  } catch (error) {
    next(error)
  }
}

function isAdmin(req) {
  return req.user.roles.includes('ADMIN')
}

function canManage(req, question) {
  return isAdmin(req) || question.author_id === req.user.userId
}

export async function createQuestion(req, res, next) {
  let question

  try {
    const sparkBounty = Number(req.body.sparkBounty || 0)

    if (!Number.isInteger(sparkBounty) || sparkBounty < 0) {
      throw createHttpError(400, 'Spark bounty must be a non-negative integer')
    }

    question = await Question.create({
      title: req.body.title,
      body: req.body.body,
      category: req.body.category,
      tags: req.body.tags,
      spark_bounty: sparkBounty,
      author_id: req.user.userId,
    })

    await reserveBounty(req.user.userId, sparkBounty, question.question_id)
    await awardSpark({
      userId: req.user.userId,
      action: 'SUBMIT_QUESTION',
      referenceId: question.question_id,
      referenceType: 'question',
    })

    res.status(201).json({
      success: true,
      questionId: question.question_id,
      message: 'Question created',
    })
  } catch (error) {
    if (question && error.statusCode === 403) {
      await Question.deleteOne({ question_id: question.question_id })
    }
    next(error)
  }
}

export async function listQuestions(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const filter = {}

    if (req.query.category) {
      filter.category = req.query.category
    }
    if (req.query.tag) {
      filter.tags = req.query.tag
    }
    if (req.query.status === 'open') {
      filter.status = { $in: ['unanswered', 'answered'] }
    } else if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.search) {
      const search = new RegExp(escapeRegex(String(req.query.search)), 'i')
      filter.$or = [{ title: search }, { body: search }, { tags: search }]
    }

    // Support ?my=1 to fetch only the current user's questions
    if (req.query.my === '1') {
      filter.author_id = req.user.userId
    }

    if (!isAdmin(req)) {
      filter.moderation_status = 'approved'
      if (filter.status === 'removed') {
        filter.status = { $exists: false }
      } else if (!filter.status) {
        filter.status = { $ne: 'removed' }
      }
    }

    const sort = req.query.sort === 'trending' ? { upvotes: -1 } : { created_at: -1 }
    const [questions, total] = await Promise.all([
      Question.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Question.countDocuments(filter),
    ])

    res.json({
      success: true,
      questions,
      pagination: paginationResult(page, limit, total),
    })
  } catch (error) {
    next(error)
  }
}

export async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findOne({ question_id: req.params.questionId })

    if (
      !question ||
      (!isAdmin(req) &&
        (question.status === 'removed' || question.moderation_status !== 'approved'))
    ) {
      throw createHttpError(404, 'Question not found')
    }

    await Question.updateOne(
      { question_id: question.question_id },
      { $inc: { view_count: 1 } },
    )

    const includeAnswers = req.query.includeAnswers !== 'false'
    const includeComments = req.query.includeComments !== 'false'
    const answerFilter = { question_id: question.question_id }
    const commentFilter = { question_id: question.question_id }

    if (!isAdmin(req)) {
      answerFilter.moderation_status = 'approved'
      answerFilter.is_deleted = { $ne: true }
      commentFilter.moderation_status = 'approved'
      commentFilter.is_deleted = { $ne: true }
    }

    const [answers, comments] = await Promise.all([
      includeAnswers ? Answer.find(answerFilter).sort({ created_at: -1 }).lean() : [],
      includeComments ? Comment.find(commentFilter).sort({ created_at: 1 }).lean() : [],
    ])

    res.json({ success: true, question, answers, comments })
  } catch (error) {
    next(error)
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const question = await Question.findOne({ question_id: req.params.questionId })

    if (!question) {
      throw createHttpError(404, 'Question not found')
    }
    if (!canManage(req, question)) {
      throw createHttpError(403, 'Forbidden')
    }
    if (!isAdmin(req) && ['closed', 'removed'].includes(question.status)) {
      throw createHttpError(409, 'Question locked or resolved')
    }

    for (const field of ['title', 'body', 'category', 'tags']) {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field]
      }
    }
    await question.save()

    res.json({ success: true, question })
  } catch (error) {
    next(error)
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const question = await Question.findOne({ question_id: req.params.questionId })

    if (!question) {
      throw createHttpError(404, 'Question not found')
    }
    if (!canManage(req, question)) {
      throw createHttpError(403, 'Forbidden')
    }
    if (question.status === 'removed') {
      throw createHttpError(409, 'Question cannot be deleted')
    }

    question.status = 'removed'
    question.moderation_status = 'rejected'
    question.removal_reason = req.body.reason || ''
    await question.save()

    res.json({ success: true, message: 'Question deleted' })
  } catch (error) {
    next(error)
  }
}

export async function acceptAnswer(req, res, next) {
  try {
    const [question, answer] = await Promise.all([
      Question.findOne({ question_id: req.params.questionId }),
      Answer.findOne({
        answer_id: req.params.answerId,
        question_id: req.params.questionId,
        is_deleted: { $ne: true },
      }),
    ])

    if (!question || !answer) {
      throw createHttpError(404, 'Question or answer not found')
    }
    if (!canManage(req, question)) {
      throw createHttpError(403, 'Forbidden')
    }
    const acceptedAnswer = await Answer.exists({
      question_id: question.question_id,
      is_accepted: true,
      is_deleted: { $ne: true },
    })

    if (acceptedAnswer) {
      throw createHttpError(409, 'Answer already accepted')
    }

    answer.is_accepted = true
    await answer.save()
    question.status = 'answered'
    await question.save()

    await awardSpark({
      userId: answer.author_id,
      action: 'ANSWER_ACCEPTED',
      referenceId: answer.answer_id,
      referenceType: 'answer',
    })

    if (question.spark_bounty > 0) {
      await awardSpark({
        userId: answer.author_id,
        action: 'BOUNTY_AWARDED',
        referenceId: question.question_id,
        referenceType: 'question',
        points: question.spark_bounty,
      })
    }

    await Notification.create({
      recipient_id: answer.author_id,
      actor_id: req.user.userId,
      type: 'accepted',
      title: 'Answer accepted',
      body: 'Your answer was accepted.',
      reference_id: question.question_id,
      reference_type: 'question',
    })

    res.json({ success: true, message: 'Answer accepted' })
  } catch (error) {
    next(error)
  }
}
