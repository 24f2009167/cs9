# Backend File Structure

```
backend/
├── src/
│   ├── app.js
│   ├── db.js
│   ├── server.js
│   ├── swagger.js
│   ├── openapi-components.js
│   ├── openapi-paths.js
│   │
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── answer.controller.js
│   │   ├── auth.controller.js
│   │   ├── comment.controller.js
│   │   ├── flag.controller.js
│   │   ├── moderation.controller.js
│   │   ├── notification.controller.js
│   │   ├── profile.controller.js
│   │   ├── question.controller.js
│   │   ├── resolver.controller.js
│   │   ├── spark.controller.js
│   │   └── user.controller.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/
│   │   ├── answer.model.js
│   │   ├── comment.model.js
│   │   ├── flag.model.js
│   │   ├── notification.model.js
│   │   ├── question-assignment-log.model.js
│   │   ├── question.model.js
│   │   ├── role.model.js
│   │   ├── spark-transaction.model.js
│   │   ├── user-profile.model.js
│   │   ├── user.model.js
│   │   └── vote.model.js
│   │
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── answer.routes.js
│   │   ├── auth.routes.js
│   │   ├── comment.routes.js
│   │   ├── flag.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── moderation.routes.js
│   │   ├── notification.routes.js
│   │   ├── profile.routes.js
│   │   ├── question.routes.js
│   │   ├── resolver.routes.js
│   │   ├── spark.routes.js
│   │   └── user.routes.js
│   │
│   ├── scheduled/
│   │   └── question-assignment.js
│   │
│   ├── scripts/
│   │   ├── migrations/
│   │   │   ├── 002-migrate-profile-identity.js
│   │   │   ├── 003-migrate-expert-profile-fields.js
│   │   │   ├── 004-migrate-upvoted-by-to-votes.js
│   │   │   ├── 005-reconcile-spark-points.js
│   │   │   └── 006-backfill-question-assignment-log-ids.js
│   │   ├── ingest-faqs.js
│   │   ├── rebuild-comment-counters.js
│   │   ├── rebuild-question-counters.js
│   │   ├── rebuild-vote-counters.js
│   │   ├── recompute-reputation.js
│   │   ├── seed-admin.js
│   │   └── seed-all.js
│   │
│   ├── services/
│   │   ├── content.service.js
│   │   ├── question-allocation.service.js
│   │   ├── role.service.js
│   │   └── spark.service.js
│   │
│   └── utils/
│       ├── auth-token.js
│       ├── featureLogger.js
│       └── http.js
│
└── package.json
```