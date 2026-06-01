# MyContributions — Implementation Plan

## Status

**Stub** — folder created, `index.jsx` exists as a placeholder, route is NOT yet added to `routes/index.jsx`.

---

## What This Page Does

Displays all contributions (questions, answers, comments) by the current user in a single unified view with tab filtering.

---

## Route

```
/my-contributions  →  MyContributionsPage
```

Protected route — requires authentication (redirects to `/` if not logged in).

---

## Current State

`index.jsx` is a functional stub with:
- [x] Tab bar (`All` / `Questions` / `Answers` / `Comments`)
- [x] Contribution list from `GET /api/users/:userId/contributions`
- [x] Tab filtering
- [x] Empty state
- [x] Loading spinner
- [x] Click question → inline detail view with "← Back"
- [x] Answer cards show "View question →" link
- [x] Accepted answer badge on answers
- [x] Score display (upvotes)

**Not yet wired to routing** — no route entry in `routes/index.jsx`.

---

## Pending Tasks

###1. Wire route
Add to `src/routes/index.jsx`:
```jsx
{
  path: '/my-contributions',
  element: <MyContributionsPage />,
}
```
Protected by auth (same guard as `/dashboard`).

### 2. Add to left pane (optional — user said do NOT add to left pane)
Skipped per user request.

### 3. Inline detail view improvements
Currently clicking a question shows a bare `QuestionCard`. Should also show:
- Answers list for that question
- Comment thread
- Reply form

### 4. "My Questions" tab detail view
When tab is `questions` and user clicks a card, currently `handleCardClick` fetches via `fetchQuestions({ questionId })`. This works but could be pre-loaded alongside contributions to avoid a second network call.

### 5. Voting on question detail
`onUpvote={() => {}}` is a no-op in detail view. Wire to `voteQuestion()` + optimistic update.

### 6. Comments tab
Clicking a comment card does nothing. Should either:
- Expand inline to show the comment's parent answer + question context
- Or navigate to the question detail with that comment highlighted

### 7. Empty state CTA
Empty "Answers" tab currently shows generic message. Could link directly to `/dashboard` with a suggestion to browse unanswered questions.

### 8. Pagination
Currently capped at `limit=50` from API. If user has more than 50 contributions, add infinite scroll or "Load more".

### 9. Skeleton loading
Replace the single spinner with per-card skeletons during initial load and tab switches.

---

## Backend API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/:userId/contributions` | GET | Required | Returns `{ contributions: [...] }` sorted by time desc |

Response shape per item:
```json
{
  "type": "question",
  "id": "...",
  "title": "...",
  "body": "...",
  "status": "published",
  "score": 5,
  "time": "2026-05-20T..."
}
{
  "type": "answer",
  "id": "...",
  "questionId": "...",
  "body": "...",
  "score": 3,
  "isAccepted": false,
  "time": "2026-05-21T..."
}
{
  "type": "comment",
  "id": "...",
  "questionId": "...",
  "answerId": "...",
  "body": "...",
  "time": "2026-05-22T..."
}
```

---

## File Structure

```
pages/user/pages/MyContributions/
├── index.jsx      ← page component (current stub)
├── PLAN.md        ← this file
└── README.md      ← (todo: add when page is fully implemented)
```
