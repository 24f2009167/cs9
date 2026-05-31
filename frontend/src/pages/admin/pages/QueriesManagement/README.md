# Queries Management

Admin view for browsing and searching recent platform questions. Filters are applied client-side from the shared `dashboardData.recent.questions` feed.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `dashboardData` | `object\|null` | Same object as `Dashboard` — accessed via `.recent.questions` |
| `searchQuery` | `string` | Passed from `AdminHeader` search bar — pre-populated when user submits a search |

## Search / Filtering

Queries are filtered client-side against `${title kind status}` (space-joined, lowercased):

```ts
visibleQueries = queries.filter(q =>
  `${q.title || ''} ${q.kind || ''} ${q.status || ''}`
    .toLowerCase().includes(searchQuery.toLowerCase())
)
```

When `searchQuery` is empty, all `recent.questions` are shown.

## Table Columns

| Column | Source field | Notes |
|--------|-------------|-------|
| ID | `question_id` | Truncated to 8 chars with `#` prefix |
| Title | `title` | Truncated with ellipsis, max-w 420px |
| Kind | `kind` | Badge: `community` or `faq`, uppercase |
| Status | `status` | Capitalized plain text |
| Author | `author_id` | Truncated to 8 chars |

## Interactions

- **Filter button** — present but not wired (placeholder for future filter panel)
- Clicking rows — no action currently wired (future: could navigate to question detail)

## Empty State

"No recent queries match this view." shown when `visibleQueries.length === 0`.