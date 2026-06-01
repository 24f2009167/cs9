# Flag Moderation

Admin view for acting on **reported content**. Lets admins review flags and take
moderation action (hide/delete content, warn/suspend the author). Server-side
paginated; two tabs.

- **Component:** [`index.jsx`](./index.jsx) — `FlagModerationView`
- **Nav:** "Flags" in the admin LeftPane (after Queries).
- **Rendered by:** [`pages/admin/index.jsx`](../../index.jsx) when
  `currentAdminView === 'flagModeration'`.

## Tabs

| Tab | Source | Purpose |
|-----|--------|---------|
| **Moderation Queue** | `GET /api/moderation/queue` | Pending flags needing action (default). |
| **All Flags** | `GET /api/flags?status=&targetType=` | Full history with a status filter (Pending / Upheld / Dismissed). |

Both endpoints return the same flag shape with the embedded `target` (the flagged
question/answer/comment), so the card + review modal are shared.

## Data

```ts
fetchModerationQueue({ page, limit, targetType })   → GET /api/moderation/queue
fetchFlags({ page, limit, status, targetType })     → GET /api/flags
resolveFlag(flagId, { status, action, resolutionNote }) → PATCH /api/flags/:id/resolve
```

Service: [`pages/admin/service.js`](../../service.js). No backend changes — these
endpoints already exist and are `ADMIN`-gated.

## Flag card

Target-type badge, reason, status (Pending / **Upheld** / **Dismissed**), the
reporter's note, a 3-line preview of the flagged content (graceful "content no
longer available" fallback), reporter id, and date. Pending flags show a
**Review** button; resolved flags show the action taken + note.

## Review modal (decision + action)

1. **Decision** — **Uphold** (`status: resolved`, content violates) or **Dismiss**
   (`status: dismissed`, no violation).
2. **Action** (only when upholding) — `no_action` · `hide_content` ·
   `delete_content` · `warn_user` · `suspend_user`. The backend applies the
   content/user effect.
3. **Resolution note** — optional; shared with the author for warnings/suspensions.

On submit → `resolveFlag` → toast + reload. Backend guards (e.g. can't suspend an
admin, already-resolved flag) surface as error toasts.

## Dashboard hooks

The Dashboard's **Open Flags** metric tile and the **Needs Attention → Review
flags** link both navigate here via `onNavigate('flagModeration')`.

## States

- **Loading** — "Loading flags…"
- **Empty** — "Nothing pending — the queue is clear." (queue) / "No flags match
  this view." (all flags).
</content>
