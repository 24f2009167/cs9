# User Management

Admin view for managing platform members — search/filter users, **promote roles
(badges)**, and control **account status**. Server-side paginated.

- **Component:** [`index.jsx`](./index.jsx) — `UserManagementView`
- **Rendered by:** [`pages/admin/index.jsx`](../../index.jsx) when
  `currentAdminView === 'userManagement'`.
- **Nav:** 3rd item in the admin LeftPane ("Users").

## Data flow

```
fetchUsers({ page, limit: 10, search, role, status })
  → GET /api/users?page=&limit=&search=&role=&status=     (ADMIN only)
  → { users: [{ id, name, email, roles, avatarUrl, sparkPoints, status, createdAt }], pagination }

assignUserRole(id, role)   → POST   /api/admin/users/:id/roles            { role }
removeUserRole(id, role)   → DELETE /api/admin/users/:id/roles/:roleName
updateUserStatus(id, s, r) → PATCH  /api/users/:id/status                 { status, reason }
```

Service: [`pages/admin/service.js`](../../service.js). No new backend was needed —
`listUsers`, `assignUserRole`/`removeUserRole`, and `updateUserStatus` already
exist and are `ADMIN`-gated.

## List

Server-paginated rows (`PAGE_SIZE = 10`), each showing: avatar, name, email, role
badges, spark points, status, and join date, plus a **Manage** button. Filters
(all debounced/applied server-side): name/email **search**, **role**, **status**.
Prev/Next pagination reflects the server `pagination` (true server-side paging).

## Manage modal

- **Roles / Badges** — toggle `USER` / `RESOLVER` / `ADMIN`. Clicking a granted
  role revokes it (`removeUserRole`); clicking an ungranted one grants it
  (`assignUserRole`). Each toggle is an immediate API call with optimistic update.
  Promoting to `RESOLVER` lets the member answer as an expert (drives the
  "Expert answer" signal); `ADMIN` grants full access.
- **Account status** — `active` / `disabled` / `suspended`, with an optional
  reason (shown for non-active). Applied via `updateUserStatus`.

## Guards (enforced backend-side, surfaced as toasts)

- Cannot remove the **final ADMIN** role (`409`).
- Cannot disable the **final active admin** (`409`).

Errors use the API's message via `notifyError`; successes via `notifySuccess`.

## States

- **Loading** — "Loading users…"
- **Empty** — "No users match this view."
</content>
