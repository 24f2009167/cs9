# QueryHub — Project Repository

**vicharanashala/cs9** — Doubt Resolution Platform

---

## Repository Structure

```
cs9/
├── README.md               ← You are here
├── context.md              ← Full project context (single source of truth)
├── LEADERBOARD.md          ← Leaderboard feature documentation
├── feature.md              ← Feature specs and roadmap
│
├── backend/
│   ├── fileStructure.md    ← Backend file tree
│   └── src/
│       ├── controllers/    ← Route handlers (answer, auth, comment, flag, notification, question, spark, user, …)
│       ├── models/         ← Mongoose schemas (answer, question, user, vote, notification, flag, …)
│       ├── routes/         ← Express route definitions
│       ├── services/       ← Business logic (content, question-allocation, spark, role)
│       ├── scheduled/      ← Cron jobs (question-assignment)
│       ├── scripts/        ← Migrations, seeds, rebuild utilities
│       ├── middleware/     ← Auth middleware, error handler
│       └── utils/          ← Feature logger, HTTP utilities
│
└── frontend/
    ├── fileStructure.md    ← Frontend file tree
    ├── context.md          ← Frontend-specific context
    ├── index.html
    ├── vite.config.js
    ├── jsconfig.json
    └── src/
        ├── App.jsx
        ├── api/            ← API client (axios instance)
        ├── components/     ← Shared UI (Button, Modal, NotificationModal)
        ├── contexts/       ← Auth, Role contexts
        ├── layouts/        ← Admin/User layout wrappers
        ├── pages/
        │   ├── user/       ← Student dashboard, contributions, profile settings
        │   │   ├── pages/Dashboard/
        │   │   ├── pages/MyContributions/
        │   │   └── pages/ProfileSettings/
        │   └── admin/      ← Admin panel, FAQ management, queries, spark leaderboard, profile
        │       ├── components/Header/, LeftPane/
        │       └── pages/Dashboard/, FAQManagement/, QueriesManagement/, SparkLeaderboard/, AdminProfile/
        ├── stores/         ← Zustand stores (auth, theme)
        └── routes/         ← React Router route definitions
```

---

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Issue #2 (antigravity issues) | ✅ Merged to `main` | 9 sub-issues fixed |
| Issue #12 (clickable cards) | ✅ Merged to `main` | QuestionCard fully clickable |
| Admin component READMEs | ✅ Merged to `main` | All admin pages documented |
| Issue #1 (voting/unvote) | ❌ Closed as NOT BUG | Unvoting already works |
| Notification fixes | 🔄 In progress | Local branch: `notification` |

**`main` SHA:** `2e25d75`

---

## Key Documentation

- **[`context.md`](./context.md)** — Full project context (source of truth for AI sessions)
- **[`backend/fileStructure.md`](./backend/fileStructure.md)** — Backend file tree
- **[`frontend/fileStructure.md`](./frontend/fileStructure.md)** — Frontend file tree
- **[`LEADERBOARD.md`](./LEADERBOARD.md)** — Leaderboard implementation
- **[`feature.md`](./feature.md)** — Feature specs and roadmap