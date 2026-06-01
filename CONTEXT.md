# Project Context — Vicharanashala (Rogāre / QueryHub)

Single source of truth for the whole project. Repo: **vicharanashala/cs9**.
For visual/design specifics see [frontend/DESIGN.md](./frontend/DESIGN.md); for data
relationships see [backend/ER_DIAGRAM.md](./backend/ER_DIAGRAM.md) and scoring in
[backend/LEADERBOARD.md](./backend/LEADERBOARD.md).

> Naming: the product is referred to as **Vicharanashala** (project_name in
> [project.yml](./project.yml)), historically **Rogāre**; the package names are
> `rogare` (frontend) / `rogare-backend`. Tagline: "Lab Internship Hub" (VLED, IIT Ropar).

---

## 1. What it is

An internship **Q&A / doubt-resolution platform** with two surfaces backed by one
`questions` collection (toggled by `kind`):

- **FAQ** — curated, resolver/admin-authored entries shown on a public FAQ page (`kind: "faq"`).
- **Community** — student-asked questions with answers, comments, and voting (`kind: "community"`).

Engagement is gamified with **spark points** and **reputation**, surfaced via
leaderboards. Reported content flows through a **flag → moderation** pipeline.

There are two front-end surfaces: a **user panel** and an **admin panel**.

---

## 2. Monorepo layout & running

```
Project0/
├── CONTEXT.md          ← this file (whole-project context)
├── README.md           ← overview + repo tree
├── CONTRIBUTING.md      FEATURE.md  LICENSE  ER-diagram.html
├── project.yml         ← project_name / tagline / owner
├── run-dev.sh          ← starts backend (:5000) + frontend (:5173)
├── backend/            ← Express 5 + Mongoose API
└── frontend/           ← React 19 + Vite SPA
```

**Run locally:** `./run-dev.sh` → backend on `http://localhost:5000`, frontend on
`http://localhost:5173`. Backend needs MongoDB + a `.env` (Mongo URI, JWT secret,
CORS origin); frontend needs `VITE_API_BASE_URL`. Seed an admin with
`cd backend && npm run seed:admin` (or `node src/scripts/seed-all.js` for demo data).
API docs (Swagger) at `/api/docs`.

---

## 3. Backend (`backend/`)

### Stack
Node ESM, **Express 5**, **Mongoose 9 / MongoDB**, `argon2` password hashing, JWT
auth, `helmet` + `cors` + `express-rate-limit`, `express-validator`, `node-cron`,
`swagger-jsdoc`/`swagger-ui-express`.

### Layered structure (`src/`)
`routes/` (Express routers + OpenAPI annotations) → `controllers/` (request
handlers) → `services/` (shared business logic) → `models/` (Mongoose schemas).
Plus `middleware/` (auth, errors), `config/` (db, swagger), `scheduled/` (cron),
`scripts/` (seed, counter rebuilds, migrations), `utils/` (http helpers:
`getPagination`, `paginationResult`, `createHttpError`, `getCreatedAtFilter`).
Entry: `server.js` (connect DB, start cron, listen) → `app.js` (middleware + route mounts).

### Auth & roles
- Login issues a **JWT delivered as an httpOnly cookie** (the frontend private
  axios client sends `withCredentials: true`).
- `middleware/authMiddleware.js`: `verifyToken` populates `req.user = { userId, role, roles }`;
  `checkRole(...roles)` gates routes.
- **Three roles**: `USER`, `RESOLVER`, `ADMIN` — stored as `Role` docs linked to users
  via the `UserRoleMapper` join collection (a user can hold several). Resolved by
  `services/role.service.js` (`getUserRoles`, `getPrimaryRole`, priority ADMIN > RESOLVER > USER).
  Admins grant/revoke roles; there are guards against removing the final admin.

### Data model (key collections)
See [backend/ER_DIAGRAM.md](./backend/ER_DIAGRAM.md) for the full picture. Highlights:

| Collection | Notes |
|------------|-------|
| `users` | name, email, `spark_points` (cache), `status` (active/disabled/suspended) |
| `user_profiles` | display_name, avatar, `reputation`, expertise |
| `roles` + `user_role_mappers` | role definitions + user↔role join |
| `questions` | `kind` (faq/community), `status`, `moderation_status`, tags, `is_anonymous`, `is_pinned/locked`, `upvotes`, `answer_count`, `view_count`, `has_expert_answer`, `spark_bounty` |
| `answers` | `author_role` snapshot, `is_expert` (resolver/admin), `is_accepted`, `is_official`, `upvotes`/`downvotes`/`score` |
| `comments` | threaded under answers (or question-level), `author_role` |
| `votes` | per-user vote ledger on questions/answers |
| `spark_transactions` | **signed ledger — source of truth for spark balances** |
| `flags` | reported content: target_type/id, reason, status (pending/approved/rejected), review_action |
| `notifications` | in-app notifications |
| `tags` | FAQ/question tags |

Many counters (`upvotes`, `answer_count`, `view_count`, `spark_points`,
`has_expert_answer`) are **denormalized cache fields**; rebuild scripts exist
(`npm run rebuild:*`, `recompute:reputation`) to reconcile drift.

### Key subsystems
- **Questions/answers/comments** — `question.controller.js` (list with filters +
  pagination; admins bypass moderation/`removed` filters), `answer.controller.js`,
  `comment.controller.js`. Resolving a question sets `status: 'closed'`.
- **Spark points** — `services/spark.service.js` is the **only** writer of balances
  (via the `spark_transactions` ledger). Actions: submit answer, accepted answer,
  bounty, references, etc.
- **Leaderboard** — `spark.controller.js` `getLeaderboard`: types `spark` /
  `reputation` / `acceptedAnswers`, optional `window` (all/today/monthly via the
  ledger). **Admins are excluded.**
- **Flags & moderation** — users `POST /api/flags`; admins list (`GET /api/flags`,
  `GET /api/moderation/queue`) and resolve (`PATCH /api/flags/:id/resolve` with a
  status + action: hide/delete content, warn/suspend author). `services/content.service.js`
  applies content actions.
- **Notifications** — created on answers, role changes, flag resolutions, warnings, etc.
- **Question auto-assignment** — `scheduled/question-assignment.js` cron +
  `services/question-allocation.service.js` (assigns unanswered questions to resolvers;
  see [FEATURE.md](./FEATURE.md)).

### API surface (mounted in `app.js`)
`/api/auth` · `/api/users` · `/api/profile` · `/api/questions` · `/api/answers` ·
`/api/comments` · `/api/admin` · `/api/flags` · `/api/notifications` · `/api/sparks` ·
`/api/leaderboard` · `/api/resolver` · `/api/moderation` · `/api/docs` (Swagger).

---

## 4. Frontend (`frontend/`)

### Stack
**React 19 + Vite 8**, **Tailwind CSS v4** (no UI kit), **Zustand** (persisted
stores), **react-router-dom v7**, **axios**, **@tanstack/react-query** (available),
**recharts**, **lucide-react** icons, **@headlessui/react**, **react-toastify**
(via `lib/notify.js`), `tailwind-merge`.

### Structure (`src/`)
```
api/axios.jsx          axiosPublic() / axisPrivate() (withCredentials)
store/                 useAuthStore (persisted), useThemeStore (persisted 'rogare-theme')
components/            shared: Button, Input, Select, Modal, Footer, NotificationModal …
lib/                   notify.js (notifySuccess/notifyError), queryClient.js
pages/
  landing/             public landing + LoginModal
  user/                user panel — routed; layout.jsx + service.js + constants.js
    components/         Header, LeftPane, QuestionCard, AnswerComments, SearchModal …
    pages/              Dashboard, QueryDetail, Leaderboard, MyContributions, ProfileSettings, RaiseQuery …
  admin/               admin panel — single shell (index.jsx), view-switching (no router)
    components/         Header, LeftPane, NotificationSidebar
    pages/              Dashboard, QueriesManagement, QueryDetail, FlagModeration,
                        UserManagement, SparkLeaderboard, FAQManagement, AdminProfile
routes/index.jsx       route table; ProtectedRoute for auth-gated pages
```
Each page/component folder carries a `README.md` documenting it. Folder structure
detail in [frontend/FILESTRUCTURE.md](./frontend/FILESTRUCTURE.md).

### Navigation models (important distinction)
- **User panel** — real **routes** (`/dashboard`, `/query/:id`, `/leaderboard`,
  `/my-contributions`, `/profile`, `/raise-query`, FAQ). SPA — switching tabs/opening
  a query inline avoids unnecessary URL churn where noted.
- **Admin panel** — **no routing**; `pages/admin/index.jsx` is a single shell that
  swaps views via `currentAdminView` state (`dashboard`, `queriesManagement`,
  `queryDetail`, `flagModeration`, `userManagement`, `sparkLeaderboard`,
  `faqManagement`, `adminProfile`). Cross-view navigation is passed down as
  `onNavigate` / `onOpenQuery` callbacks.

### State ownership
| State | Where |
|-------|-------|
| Auth (user, token) | `useAuthStore` (Zustand, persisted) |
| Theme (dark mode) | `useThemeStore` (persisted, `.dark` class on `<body>`) |
| UI (modals, active tab/view, filters) | component `useState` |
| Server data | `useState` + service calls in `useEffect` (server-side pagination where lists are large) |

### Service layer
Network calls live in `service.js` files, never in components. Shared user services
in `pages/user/service.js`; admin services in `pages/admin/service.js`; page-specific
services co-located. Use `axisPrivate()` for authed calls (sends the cookie),
`axiosPublic()` otherwise.

### Conventions
- **Components**: one folder per shared component, **direct imports** (no barrel
  `index` files for single-component folders). Promote to `components/` only when reused.
- **Styling**: semantic Tailwind tokens (`bg-bg-card`, `text-text-primary`, `border-border`,
  brand `#8c6a40`) defined in `src/index.css`; dark mode via the same `--color-*` vars
  under `.dark`. **Don't hardcode hex when a token exists.** Full rules in
  [frontend/DESIGN.md](./frontend/DESIGN.md).
- **Feedback**: `notifySuccess()` / `notifyError()` — never `window.alert`.
- **Icons**: lucide-react, `strokeWidth={1.8}` default.
- **Lists**: server-side pagination (≈10/page) with Prev/Next; modals follow the
  sectioned header/body/footer pattern (see FAQ/User/Flag modals).

---

## 5. Cross-cutting notes & gotchas

- **Spark balances** are ledger-derived — never mutate `user.spark_points` directly;
  go through `spark.service.js`.
- **Admins are excluded** from leaderboards and (as content authors) display as
  **"ADMIN"** rather than their name (`author_role === 'ADMIN'`).
- **Anonymous questions** (`is_anonymous`) show an "Anonymous" indicator and never
  expose the author.
- **`view_count`** is currently a raw hit counter (incremented on every detail fetch,
  including refetches) — known issue, should become unique-per-user. The admin Queries
  list hides it for now.
- **Soft deletes**: deleting questions/FAQs sets `status: 'removed'` (not a hard delete);
  admin lists filter these out client-side.
- The user query-detail page refetches **silently** after votes/comments (no full-page
  loading flash).

---

## 6. Doc pointers

- [frontend/DESIGN.md](./frontend/DESIGN.md) — design system, color tokens, typography, components.
- [frontend/FILESTRUCTURE.md](./frontend/FILESTRUCTURE.md) — frontend file tree.
- [backend/ER_DIAGRAM.md](./backend/ER_DIAGRAM.md) — collections + cache ownership.
- [backend/LEADERBOARD.md](./backend/LEADERBOARD.md) — spark / reputation / accepted-answer scoring.
- [FEATURE.md](./FEATURE.md) — question auto-assignment cron spec.
- Per-folder `README.md` files document individual pages/components.
</content>
