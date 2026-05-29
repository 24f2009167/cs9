const errorContent = {
  'application/json': { schema: { $ref: '#/components/schemas/Error' } },
}

export default {
  securitySchemes: {
    cookieAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'token',
      description: 'HTTP-only cookie set by a successful login.',
    },
  },
  responses: {
    BadRequest: { description: 'Validation error.', content: errorContent },
    Unauthorized: { description: 'Authentication is required.', content: errorContent },
    Forbidden: { description: 'The authenticated role is not permitted.', content: errorContent },
    NotFound: { description: 'Requested resource not found.', content: errorContent },
    Conflict: { description: 'Request conflicts with current state.', content: errorContent },
  },
  schemas: {
    Error: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string' },
      },
    },
    MessageResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string' },
      },
    },
    HealthResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'active-backend' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
    Pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        pages: { type: 'integer' },
      },
    },
    RecordResponse: {
      type: 'object',
      additionalProperties: true,
      properties: { success: { type: 'boolean', example: true } },
    },
    PagedResponse: {
      type: 'object',
      additionalProperties: true,
      properties: {
        success: { type: 'boolean', example: true },
        pagination: { $ref: '#/components/schemas/Pagination' },
      },
    },
    User: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['USER', 'RESOLVER', 'ADMIN'] },
        roles: {
          type: 'array',
          items: { type: 'string', enum: ['USER', 'RESOLVER', 'ADMIN'] },
        },
        status: { type: 'string', enum: ['active', 'disabled', 'suspended'] },
      },
    },
    SignupInput: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', maxLength: 100 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', format: 'password', minLength: 8, writeOnly: true },
        role: { type: 'string', enum: ['USER'], default: 'USER' },
      },
    },
    SignupResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        userId: { type: 'string', format: 'uuid' },
        role: { type: 'string', example: 'USER' },
        message: { type: 'string' },
      },
    },
    LoginInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', format: 'password', writeOnly: true },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: { $ref: '#/components/schemas/User' },
        data: {
          type: 'object',
          properties: { user: { $ref: '#/components/schemas/User' } },
        },
      },
    },
    UserStatusInput: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['active', 'disabled', 'suspended'] },
        reason: { type: 'string' },
      },
    },
    ProfileUpdateInput: {
      type: 'object',
      properties: {
        displayName: { type: 'string' },
        bio: { type: 'string' },
        avatarUrl: { type: 'string' },
        expertise: { type: 'array', items: { type: 'string' } },
        location: { type: 'string' },
        socialLinks: { type: 'object', additionalProperties: { type: 'string' } },
      },
    },
    QuestionInput: {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        title: { type: 'string', minLength: 10 },
        body: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        sparkBounty: { type: 'integer', minimum: 0 },
      },
    },
    QuestionUpdateInput: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
    AnswerInput: {
      type: 'object',
      required: ['body'],
      properties: {
        body: { type: 'string', minLength: 20 },
        references: { type: 'array', items: { type: 'object' } },
        attachments: { type: 'array', items: { type: 'object' } },
      },
    },
    AnswerUpdateInput: {
      type: 'object',
      required: ['body'],
      properties: { body: { type: 'string', minLength: 20 } },
    },
    ReasonInput: {
      type: 'object',
      properties: { reason: { type: 'string' } },
    },
    VoteInput: {
      type: 'object',
      required: ['vote'],
      properties: { vote: { type: 'string', enum: ['up'] } },
    },
    CommentInput: {
      type: 'object',
      required: ['targetType', 'targetId', 'body'],
      properties: {
        targetType: { type: 'string', enum: ['answer'] },
        targetId: { type: 'string' },
        parentId: { type: 'string' },
        body: { type: 'string', maxLength: 2000 },
      },
    },
    CommentUpdateInput: {
      type: 'object',
      required: ['body'],
      properties: { body: { type: 'string', maxLength: 2000 } },
    },
    FlagInput: {
      type: 'object',
      required: ['targetType', 'targetId', 'reason'],
      properties: {
        targetType: { type: 'string', enum: ['question', 'answer', 'comment'] },
        targetId: { type: 'string' },
        reason: { type: 'string' },
        description: { type: 'string' },
      },
    },
    ResolveFlagInput: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['resolved', 'dismissed', 'approved', 'rejected'] },
        action: {
          type: 'string',
          enum: ['no_action', 'hide_content', 'delete_content', 'warn_user', 'suspend_user'],
        },
        resolutionNote: { type: 'string' },
      },
    },
    RoleInput: {
      type: 'object',
      required: ['role'],
      properties: { role: { type: 'string', enum: ['USER', 'RESOLVER', 'ADMIN'] } },
    },
    ResolverExpertiseInput: {
      type: 'object',
      properties: {
        expertise: { type: 'array', items: { type: 'string' } },
        categories: { type: 'array', items: { type: 'string' } },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
    ModerateContentInput: {
      type: 'object',
      required: ['targetType', 'targetId', 'action'],
      properties: {
        targetType: { type: 'string', enum: ['question', 'answer', 'comment'] },
        targetId: { type: 'string' },
        action: { type: 'string', enum: ['approve', 'hide', 'restore', 'delete', 'lock', 'unlock'] },
        reason: { type: 'string' },
      },
    },
    WarningInput: {
      type: 'object',
      required: ['reason', 'message'],
      properties: { reason: { type: 'string' }, message: { type: 'string' } },
    },
  },
}
