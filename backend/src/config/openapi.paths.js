const cookieSecurity = [{ cookieAuth: [] }]
const schema = (name) => ({ $ref: `#/components/schemas/${name}` })
const componentResponse = (name) => ({ $ref: `#/components/responses/${name}` })
const response = (description, bodySchema = schema('RecordResponse')) => ({
  description,
  content: { 'application/json': { schema: bodySchema } },
})
const body = (name) => ({
  required: true,
  content: { 'application/json': { schema: schema(name) } },
})
const path = (name, description) => ({
  in: 'path',
  name,
  required: true,
  description,
  schema: { type: 'string' },
})
const query = (name, valueSchema, description) => ({
  in: 'query',
  name,
  description,
  schema: valueSchema,
})
const pagination = [
  query('page', { type: 'integer', minimum: 1, default: 1 }, 'Page number.'),
  query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Items per page.'),
]
const period = [
  query('from', { type: 'string', format: 'date-time' }, 'Start timestamp.'),
  query('to', { type: 'string', format: 'date-time' }, 'End timestamp.'),
]
const securedErrors = { 401: componentResponse('Unauthorized') }
const adminErrors = { ...securedErrors, 403: componentResponse('Forbidden') }
const secured = (operation) => ({ security: cookieSecurity, ...operation })

export default {
  '/': {
    get: {
      operationId: 'welcome',
      summary: 'Get the API welcome message',
      tags: ['System'],
      responses: { 200: response('API is running.', schema('MessageResponse')) },
    },
  },
  '/api/health': {
    get: {
      operationId: 'health',
      summary: 'Check service health',
      tags: ['System'],
      responses: { 200: response('Backend is available.', schema('HealthResponse')) },
    },
  },
  '/api/auth/signup': {
    post: {
      operationId: 'signup',
      summary: 'Register a USER account',
      description: 'Privileged roles are assigned by an ADMIN.',
      tags: ['Authentication'],
      requestBody: body('SignupInput'),
      responses: {
        201: response('Signup successful.', schema('SignupResponse')),
        400: componentResponse('BadRequest'),
        403: componentResponse('Forbidden'),
        409: componentResponse('Conflict'),
      },
    },
  },
  '/api/auth/register': {
    post: {
      operationId: 'registerAlias',
      summary: 'Register a USER account (signup alias)',
      tags: ['Authentication'],
      requestBody: body('SignupInput'),
      responses: {
        201: response('Signup successful.', schema('SignupResponse')),
        400: componentResponse('BadRequest'),
        403: componentResponse('Forbidden'),
        409: componentResponse('Conflict'),
      },
    },
  },
  '/api/auth/login': {
    post: {
      operationId: 'login',
      summary: 'Authenticate and issue the HTTP-only cookie',
      tags: ['Authentication'],
      requestBody: body('LoginInput'),
      responses: {
        200: response('Credentials accepted.', schema('AuthResponse')),
        401: componentResponse('Unauthorized'),
        403: componentResponse('Forbidden'),
      },
    },
  },
  '/api/auth/admin/login': {
    post: {
      operationId: 'adminLoginAlias',
      summary: 'Authenticate using the admin login alias',
      tags: ['Authentication'],
      requestBody: body('LoginInput'),
      responses: {
        200: response('Credentials accepted.', schema('AuthResponse')),
        401: componentResponse('Unauthorized'),
        403: componentResponse('Forbidden'),
      },
    },
  },
  '/api/auth/logout': {
    post: secured({
      operationId: 'logout',
      summary: 'Clear the authentication cookie',
      tags: ['Authentication'],
      responses: {
        200: response('Logged out.', schema('MessageResponse')),
        ...securedErrors,
      },
    }),
  },
  '/api/auth/me': {
    get: secured({
      operationId: 'me',
      summary: 'Get the authenticated user',
      tags: ['Authentication'],
      responses: {
        200: response('Current user.', schema('AuthResponse')),
        ...securedErrors,
      },
    }),
  },
  '/api/users': {
    get: secured({
      operationId: 'listUsers',
      summary: 'List users for administration',
      description: 'Requires ADMIN role.',
      tags: ['Users', 'Admin'],
      parameters: [
        ...pagination,
        query('role', { type: 'string', enum: ['USER', 'RESOLVER', 'ADMIN'] }, 'Role filter.'),
        query('status', { type: 'string', enum: ['active', 'disabled', 'suspended'] }, 'Status filter.'),
        query('search', { type: 'string' }, 'Search name or email.'),
      ],
      responses: { 200: response('Users.', schema('PagedResponse')), ...adminErrors },
    }),
  },
  '/api/users/{userId}': {
    get: secured({
      operationId: 'getUserById',
      summary: 'Get user profile and content statistics',
      tags: ['Users'],
      parameters: [path('userId', 'Public user UUID.')],
      responses: {
        200: response('User detail.'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
  },
  '/api/users/{userId}/status': {
    patch: secured({
      operationId: 'updateUserStatus',
      summary: 'Update user account status',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: [path('userId', 'Public user UUID.')],
      requestBody: body('UserStatusInput'),
      responses: {
        200: response('Status updated.', schema('MessageResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...adminErrors,
      },
    }),
  },
  '/api/profile/me': {
    get: secured({
      operationId: 'getMyProfile',
      summary: 'Get the authenticated profile',
      tags: ['Users'],
      responses: { 200: response('Profile.'), ...securedErrors },
    }),
    patch: secured({
      operationId: 'updateMyProfile',
      summary: 'Update editable profile fields',
      tags: ['Users'],
      requestBody: body('ProfileUpdateInput'),
      responses: {
        200: response('Updated profile.'),
        400: componentResponse('BadRequest'),
        ...securedErrors,
      },
    }),
  },
  '/api/profile/{userId}': {
    get: secured({
      operationId: 'getPublicProfile',
      summary: 'Get a public profile',
      tags: ['Users'],
      parameters: [path('userId', 'Public user UUID.')],
      responses: {
        200: response('Public profile.'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
  },
  '/api/questions': {
    get: secured({
      operationId: 'listQuestions',
      summary: 'List questions',
      tags: ['Questions'],
      parameters: [
        ...pagination,
        query('category', { type: 'string' }, 'Category filter.'),
        query('tag', { type: 'string' }, 'Tag filter.'),
        query('status', { type: 'string' }, 'Question status filter.'),
        query('sort', { type: 'string', enum: ['newest', 'trending'] }, 'Sort order.'),
        query('search', { type: 'string' }, 'Search content.'),
      ],
      responses: { 200: response('Questions.', schema('PagedResponse')), ...securedErrors },
    }),
    post: secured({
      operationId: 'createQuestion',
      summary: 'Create a question',
      tags: ['Questions'],
      requestBody: body('QuestionInput'),
      responses: {
        201: response('Question created.'),
        400: componentResponse('BadRequest'),
        403: componentResponse('Forbidden'),
        ...securedErrors,
      },
    }),
  },
  '/api/questions/{questionId}': {
    get: secured({
      operationId: 'getQuestionById',
      summary: 'Get a question with answers and comments',
      tags: ['Questions'],
      parameters: [
        path('questionId', 'Question UUID.'),
        query('includeAnswers', { type: 'boolean', default: true }, 'Include answers.'),
        query('includeComments', { type: 'boolean', default: true }, 'Include comments.'),
      ],
      responses: {
        200: response('Question detail.'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
    patch: secured({
      operationId: 'updateQuestion',
      summary: 'Edit a question as owner or ADMIN',
      tags: ['Questions'],
      parameters: [path('questionId', 'Question UUID.')],
      requestBody: body('QuestionUpdateInput'),
      responses: {
        200: response('Question updated.'),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
    delete: secured({
      operationId: 'deleteQuestion',
      summary: 'Soft delete a question as owner or ADMIN',
      tags: ['Questions'],
      parameters: [path('questionId', 'Question UUID.')],
      requestBody: body('ReasonInput'),
      responses: {
        200: response('Question deleted.', schema('MessageResponse')),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
  },
  '/api/questions/{questionId}/answers': {
    post: secured({
      operationId: 'createAnswer',
      summary: 'Post an answer',
      tags: ['Answers'],
      parameters: [path('questionId', 'Question UUID.')],
      requestBody: body('AnswerInput'),
      responses: {
        201: response('Answer created.'),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
  },
  '/api/questions/{questionId}/accept-answer/{answerId}': {
    post: secured({
      operationId: 'acceptAnswer',
      summary: 'Accept an answer as question owner or ADMIN',
      tags: ['Questions', 'Answers'],
      parameters: [
        path('questionId', 'Question UUID.'),
        path('answerId', 'Answer UUID.'),
      ],
      responses: {
        200: response('Answer accepted.', schema('MessageResponse')),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
  },
  '/api/answers/{answerId}': {
    patch: secured({
      operationId: 'updateAnswer',
      summary: 'Edit an answer as owner or ADMIN',
      tags: ['Answers'],
      parameters: [path('answerId', 'Answer UUID.')],
      requestBody: body('AnswerUpdateInput'),
      responses: {
        200: response('Answer updated.'),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
    delete: secured({
      operationId: 'deleteAnswer',
      summary: 'Soft delete an answer as owner or ADMIN',
      tags: ['Answers'],
      parameters: [path('answerId', 'Answer UUID.')],
      requestBody: body('ReasonInput'),
      responses: {
        200: response('Answer deleted.', schema('MessageResponse')),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
  },
  '/api/answers/{answerId}/vote': {
    post: secured({
      operationId: 'voteAnswer',
      summary: 'Upvote an answer',
      tags: ['Answers'],
      parameters: [path('answerId', 'Answer UUID.')],
      requestBody: body('VoteInput'),
      responses: {
        200: response('Vote recorded.'),
        400: componentResponse('BadRequest'),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
  },
  '/api/comments': {
    get: secured({
      operationId: 'listComments',
      summary: 'List comments for a target',
      tags: ['Comments'],
      parameters: [
        ...pagination,
        query('targetType', { type: 'string', enum: ['question', 'answer'] }, 'Target type.'),
        query('targetId', { type: 'string' }, 'Target UUID.'),
      ],
      responses: {
        200: response('Comments.', schema('PagedResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
    post: secured({
      operationId: 'createComment',
      summary: 'Add a comment or one-level reply to an answer',
      tags: ['Comments'],
      requestBody: body('CommentInput'),
      responses: {
        201: response('Comment created.'),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        422: response('Maximum nesting depth exceeded.', schema('Error')),
        ...securedErrors,
      },
    }),
  },
  '/api/comments/{commentId}': {
    patch: secured({
      operationId: 'updateComment',
      summary: 'Edit a comment as owner or ADMIN',
      tags: ['Comments'],
      parameters: [path('commentId', 'Comment UUID.')],
      requestBody: body('CommentUpdateInput'),
      responses: {
        200: response('Comment updated.'),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
    delete: secured({
      operationId: 'deleteComment',
      summary: 'Soft delete a comment as owner or ADMIN',
      tags: ['Comments'],
      parameters: [path('commentId', 'Comment UUID.')],
      responses: {
        200: response('Comment deleted.', schema('MessageResponse')),
        403: componentResponse('Forbidden'),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
  },
  '/api/flags': {
    post: secured({
      operationId: 'createFlag',
      summary: 'Report inappropriate content',
      tags: ['Flags'],
      requestBody: body('FlagInput'),
      responses: {
        201: response('Flag submitted.'),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...securedErrors,
      },
    }),
    get: secured({
      operationId: 'listFlags',
      summary: 'List content reports for ADMIN review',
      description: 'Requires ADMIN role.',
      tags: ['Flags', 'Admin'],
      parameters: [
        ...pagination,
        query('status', { type: 'string' }, 'Status filter.'),
        query('targetType', { type: 'string', enum: ['question', 'answer', 'comment'] }, 'Target filter.'),
        query('reason', { type: 'string' }, 'Reason filter.'),
      ],
      responses: { 200: response('Flags.', schema('PagedResponse')), ...adminErrors },
    }),
  },
  '/api/flags/{flagId}/resolve': {
    patch: secured({
      operationId: 'resolveFlag',
      summary: 'Resolve or dismiss a flag as ADMIN',
      description: 'Requires ADMIN role.',
      tags: ['Flags', 'Admin'],
      parameters: [path('flagId', 'Flag UUID.')],
      requestBody: body('ResolveFlagInput'),
      responses: {
        200: response('Flag resolved.', schema('MessageResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...adminErrors,
      },
    }),
  },
  '/api/notifications': {
    get: secured({
      operationId: 'listNotifications',
      summary: 'List the authenticated user notifications',
      tags: ['Notifications'],
      parameters: [
        ...pagination,
        query('read', { type: 'boolean' }, 'Read filter.'),
        query('type', { type: 'string' }, 'Notification type.'),
      ],
      responses: { 200: response('Notifications.', schema('PagedResponse')), ...securedErrors },
    }),
  },
  '/api/notifications/{notificationId}/read': {
    patch: secured({
      operationId: 'markNotificationRead',
      summary: 'Mark a notification as read',
      tags: ['Notifications'],
      parameters: [path('notificationId', 'Notification UUID.')],
      responses: {
        200: response('Notification marked read.', schema('MessageResponse')),
        404: componentResponse('NotFound'),
        ...securedErrors,
      },
    }),
  },
  '/api/notifications/read-all': {
    patch: secured({
      operationId: 'markAllNotificationsRead',
      summary: 'Mark all notifications as read',
      tags: ['Notifications'],
      responses: { 200: response('Notifications marked read.'), ...securedErrors },
    }),
  },
  '/api/sparks/balance': {
    get: secured({
      operationId: 'getSparkBalance',
      summary: 'Get current spark balance',
      tags: ['Leaderboard'],
      responses: { 200: response('Balance.'), ...securedErrors },
    }),
  },
  '/api/sparks/transactions': {
    get: secured({
      operationId: 'listSparkTransactions',
      summary: 'List the authenticated user spark transactions',
      tags: ['Leaderboard'],
      parameters: [
        ...pagination,
        query('type', { type: 'string' }, 'Transaction action.'),
        ...period,
      ],
      responses: { 200: response('Transactions.', schema('PagedResponse')), ...securedErrors },
    }),
  },
  '/api/leaderboard': {
    get: secured({
      operationId: 'getLeaderboard',
      summary: 'List ranked users',
      tags: ['Leaderboard'],
      parameters: [
        query('type', { type: 'string', enum: ['reputation', 'spark', 'acceptedAnswers'] }, 'Ranking basis.'),
        query('role', { type: 'string', enum: ['USER', 'RESOLVER', 'ADMIN'] }, 'Role filter.'),
        query('limit', { type: 'integer', minimum: 1, maximum: 100 }, 'Maximum rows.'),
      ],
      responses: {
        200: response('Leaderboard.'),
        400: componentResponse('BadRequest'),
        ...securedErrors,
      },
    }),
  },
  '/api/admin/dashboard': {
    get: secured({
      operationId: 'getAdminDashboard',
      summary: 'Get platform metrics',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: period,
      responses: { 200: response('Dashboard metrics.'), ...adminErrors },
    }),
  },
  '/api/admin/users/{userId}/roles': {
    post: secured({
      operationId: 'assignUserRole',
      summary: 'Assign a role to a user',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: [path('userId', 'Public user UUID.')],
      requestBody: body('RoleInput'),
      responses: {
        201: response('Role assigned.', schema('MessageResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...adminErrors,
      },
    }),
  },
  '/api/admin/users/{userId}/roles/{roleName}': {
    delete: secured({
      operationId: 'removeUserRole',
      summary: 'Remove a user role',
      description: 'Requires ADMIN role; the final ADMIN role cannot be removed.',
      tags: ['Admin'],
      parameters: [
        path('userId', 'Public user UUID.'),
        path('roleName', 'Role name.'),
      ],
      responses: {
        200: response('Role removed.', schema('MessageResponse')),
        404: componentResponse('NotFound'),
        409: componentResponse('Conflict'),
        ...adminErrors,
      },
    }),
  },
  '/api/admin/sparks/transactions': {
    get: secured({
      operationId: 'listAdminSparkTransactions',
      summary: 'Audit the platform spark ledger',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: [
        ...pagination,
        query('userId', { type: 'string' }, 'User UUID.'),
        query('type', { type: 'string' }, 'Transaction action.'),
        ...period,
      ],
      responses: { 200: response('Audit records.', schema('PagedResponse')), ...adminErrors },
    }),
  },
  '/api/resolver/questions': {
    get: secured({
      operationId: 'getResolverQueue',
      summary: 'Get resolver question queue',
      description: 'Requires RESOLVER or ADMIN role.',
      tags: ['Questions'],
      parameters: [
        ...pagination,
        query('category', { type: 'string' }, 'Category filter.'),
        query('tag', { type: 'string' }, 'Tag filter.'),
        query('unanswered', { type: 'boolean', default: true }, 'Only unanswered items.'),
        query('sort', { type: 'string' }, 'Queue sort.'),
      ],
      responses: { 200: response('Resolver queue.', schema('PagedResponse')), ...adminErrors },
    }),
  },
  '/api/resolver/stats': {
    get: secured({
      operationId: 'getResolverStats',
      summary: 'Get resolver performance metrics',
      description: 'Requires RESOLVER or ADMIN role.',
      tags: ['Leaderboard'],
      parameters: period,
      responses: { 200: response('Resolver metrics.'), ...adminErrors },
    }),
  },
  '/api/resolver/expertise': {
    patch: secured({
      operationId: 'updateResolverExpertise',
      summary: 'Update resolver expertise',
      description: 'Requires RESOLVER or ADMIN role.',
      tags: ['Users'],
      requestBody: body('ResolverExpertiseInput'),
      responses: {
        200: response('Expertise updated.'),
        400: componentResponse('BadRequest'),
        ...adminErrors,
      },
    }),
  },
  '/api/moderation/queue': {
    get: secured({
      operationId: 'getModerationQueue',
      summary: 'List moderation queue items',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: [
        ...pagination,
        query('status', { type: 'string' }, 'Flag status.'),
        query('targetType', { type: 'string', enum: ['question', 'answer', 'comment'] }, 'Target type.'),
      ],
      responses: { 200: response('Moderation queue.', schema('PagedResponse')), ...adminErrors },
    }),
  },
  '/api/moderation/content': {
    patch: secured({
      operationId: 'moderateContent',
      summary: 'Apply a moderation action',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      requestBody: body('ModerateContentInput'),
      responses: {
        200: response('Moderation applied.', schema('MessageResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        ...adminErrors,
      },
    }),
  },
  '/api/moderation/users/{userId}/warn': {
    post: secured({
      operationId: 'warnUser',
      summary: 'Send a moderation warning',
      description: 'Requires ADMIN role.',
      tags: ['Admin'],
      parameters: [path('userId', 'Public user UUID.')],
      requestBody: body('WarningInput'),
      responses: {
        201: response('Warning sent.', schema('MessageResponse')),
        400: componentResponse('BadRequest'),
        404: componentResponse('NotFound'),
        ...adminErrors,
      },
    }),
  },
}
