# Feature: Cron-Based Auto-Assignment of Unanswered Questions

## Status

**Implemented** — all files created, wired into `server.js` on startup.

Files created:
- `backend/src/models/question-assignment-log.model.js`
- `backend/src/services/question-allocation.service.js`
- `backend/src/scheduled/question-assignment.js`
- `backend/src/utils/featureLogger.js`
- `backend/logs/.gitkeep`
- `backend/.gitignore` (updated)
- `backend/src/models/question.model.js` (updated — `assigned_to` field added)
- `backend/src/server.js` (updated — cron started on startup)
- `FEATURE.md` (this file)

---

## Goal

Automatically assign unanswered questions (community, `status: 'unanswered'`, older than 48 hours) to the least-loaded active resolver, on a recurring schedule.

---

## Motivation

- Resolvers currently have to manually claim questions from the admin queue
- Unanswered questions pile up while some resolvers are idle
- Automating assignment reduces resolution time without adding admin overhead

---

## Design

### 1. Add `assigned_to` field to Question model

```js
// src/models/question.model.js

assigned_to: {
  type: String,          // resolver user_id
  default: null,         // null = unassigned
  index: true,
},
```

Add compound index:
```js
questionSchema.index({ status: 1, assigned_to: 1, created_at: -1 })
```

### 2. New model: QuestionAssignmentLog

Tracks every auto-assignment for auditability.

```js
// src/models/question-assignment-log.model.js

const questionAssignmentLogSchema = new Schema({
  question_id:  { type: String, required: true, index: true },
  resolver_id:  { type: String, required: true, index: true },
  assigned_by:  { type: String, default: 'SYSTEM' },  // 'SYSTEM' or admin user_id
  reason:       { type: String, default: 'auto-unanswered-48h' },
  assigned_at:  { type: Date,   default: Date.now },
  expires_at:   { type: Date }, // optional SLA deadline
}, { timestamps: false })
```

### 3. Cron job: question-assignment.js

**Schedule:** Every15 minutes (`*/15 * * * *`)

**Logic:**
```
1. Find all questions WHERE:
     status = 'unanswered'
     kind = 'community'
     assigned_to IS NULL
     created_at < (now - 48 hours)

2. If count == 0 → log "No questions need assignment" and exit

3. Get active resolvers (role = 'RESOLVER', is_active = true)
   → sort by ascending question_count (least-loaded first)

4. For each unassigned question (oldest first):
   a. Pick resolver with lowest current assignment count
   b. Update question: assigned_to = resolver._id
   c. Create QuestionAssignmentLog entry
   d. Create notification for resolver: "A question has been auto-assigned to you"
   e. Log to feature.log: [ASSIGNMENT] question_id | resolver_id | timestamp
```

**Run location:** `src/scheduled/question-assignment.js`

### 4. Feature log

File: `backend/logs/feature.log` (one line per event, newline-delimited JSON)

| Event | Fields |
|-------|--------|
| `ASSIGNMENT` | `question_id`, `resolver_id`, `assigned_by='SYSTEM'`, `queued_duration_hrs`, `timestamp` |
| `NO_ASSIGNMENT_NEEDED` | `count`, `timestamp` |
| `RESOLVER_UNAVAILABLE` | `question_id`, `reason`, `timestamp` |
| `ERROR` | `question_id`, `error`, `timestamp` |

Log rotation: keep last 7 days. Implemented by checking file size/date on startup or via external logrotate.

### 5. Notification

When a question is auto-assigned, create a notification for the resolver:

```js
{
  recipient_id: resolver_id,
  type: 'AUTO_ASSIGNMENT',
  message: `Question "${question.title}" has been auto-assigned to you. It was posted ${queuedDuration} hours ago.`,
  link: `/dashboard/query/${question.question_id}`,
  is_read: false,
  created_at: Date.now()
}
```

### 6. Integration into server.js

```js
// src/server.js
import { startQuestionAssignmentCron } from './scheduled/question-assignment.js'

// After DB is connected:
startQuestionAssignmentCron()
```

---

## Implementation Order

| Step | File | Description |
|------|------|-------------|
| 1 | `src/models/question.model.js` | Add `assigned_to` field + compound index |
| 2 | `src/models/question-assignment-log.model.js` | **NEW** — audit log model |
| 3 | `src/services/question-allocation.service.js` | **NEW** — core allocation logic |
| 4 | `src/scheduled/question-assignment.js` | **NEW** — cron job definition |
| 5 | `src/server.js` | Import and start the cron on startup |
| 6 | `backend/logs/` | Create logs directory (gitignored) |
| 7 | `backend/FEATURE.md` | This file (root) |

---

## API Impact

- **No new API endpoints** — this is a backend-only background job
- Existing endpoints unaffected
- `assigned_to` readable on `GET /api/questions/:id` and `GET /api/questions`

---

## Resolver Load Balancing

Load = number of **open** questions currently assigned to the resolver.

```js
Question.countDocuments({
  assigned_to: resolver._id,
  status: { $in: ['unanswered', 'answered', 'in_progress'] }
})
```

The resolver with the lowest count gets the next assignment.

---

## Failure Handling

- If the allocation loop errors mid-way, partial assignments can occur
- Wrap each question assignment in try/catch → log ERROR and continue to next
- On startup, check if a cron is already running (PID file or DB lock) to prevent double-run
- `node-cron` schedules in-process — if the server restarts, the job resumes automatically on next startup

---

## Monitoring / Observability

- All events written to `backend/logs/feature.log`
- Admin dashboard: future enhancement — show assignment stats (total assigned today, per-resolver load)
- Alert on `ERROR` events (future: email admin on 3+ consecutive failures)

---

## Rollback Plan

- To disable: comment out `startQuestionAssignmentCron()` in `server.js`
- To reverse an assignment: admin can manually reassign via existing PATCH endpoint (once implemented)
- AssignmentLog is append-only — never delete entries

---

## File Structure After Implementation

```
backend/
├── logs/
│   └── feature.log         ← auto-assignment events (gitignored)
├── src/
│   ├── models/
│   │   └── question-assignment-log.model.js   ← NEW
│   ├── scheduled/
│   │   └── question-assignment.js             ← NEW
│   └── services/
│       └── question-allocation.service.js      ← NEW
└── FEATURE.md              ← this file
```
