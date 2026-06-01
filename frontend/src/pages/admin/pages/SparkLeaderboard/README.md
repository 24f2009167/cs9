# Spark Leaderboard

Admin view for the spark-point leaderboard. Self-fetching (no props); ranks
contributors by spark points over a selectable time window, with name search and
pagination.

- **Component:** [`index.jsx`](./index.jsx) — `SparkLeaderboardView`
- **Rendered by:** [`pages/admin/index.jsx`](../../index.jsx) when
  `currentAdminView === 'sparkLeaderboard'`.

## Data source

```ts
fetchLeaderboard({ type: 'spark', limit: 20, window })   // window: 'all' | 'monthly' | 'today'
  → GET /api/leaderboard?type=spark&limit=20&window=<window>
```

Re-fetches on every `window` change. Search and pagination are applied
client-side over the fetched rows. ([`fetchLeaderboard`](../../../user/service.js)
is shared with the user-facing Leaderboard.)

### Time window (backend)

| Window | How the score is computed |
|--------|----------------------------|
| `all` | Cached `User.spark_points` balance (all-time). |
| `monthly` | Sum of `SparkTransaction.points` since the 1st of the current month. |
| `today` | Sum of `SparkTransaction.points` since local midnight. |

Windowed ranks aggregate the spark ledger (`spark_transactions`) in
`getLeaderboard` ([`spark.controller.js`](../../../../../backend/src/controllers/spark.controller.js)).
Admins are excluded from the leaderboard in all windows.

## Leader entry shape

```ts
{
  userId:          string,
  displayName:     string,
  score:           number,   // spark points for the active window
  answersCount:    number,   // all-time non-deleted answers authored
  upvotesReceived: number,   // all-time upvotes on those answers
}
```

`answersCount` / `upvotesReceived` are populated by an `Answer` aggregation in the
controller (not window-scoped — they reflect the user's overall contribution).

## State

| State | Default | Description |
|-------|---------|-------------|
| `leaders` | `[]` | Fetched entries (already sorted high → low) |
| `loading` | `true` | Load flag |
| `timeWindow` | `'all'` | `all` / `monthly` / `today` |
| `search` | `''` | Name filter (client-side) |
| `page` | `1` | Pagination page (1-based) |

## UI

- **Metric strip** — Total sparks for the window (label adapts:
  *All-Time Spark Total* / *Sparks This Month* / *Sparks Today*), Top Earner
  (score + name), and Ranked Contributors count.
- **Table** — Rank, Scholar (avatar + name), Questions Answered, Upvotes Received,
  Spark Balance. Top 3 ranks show emoji medals (🥇🥈🥉); rank 4+ shows a
  zero-padded number. **True leaderboard rank is preserved under search/paging.**
- **Search** — filters by display name; shows a "no match" state.
- **Pagination** — client-side at **10 per page** (`PAGE_SIZE`); Prev/Next render
  only when there's more than one page. Page resets on window/search change and is
  clamped when the result set shrinks.

## States

- **Loading** — "Loading leaderboard…"
- **Empty** — "No spark data yet." when the window returns no rows.
- **No match** — when a search yields nothing.
</content>
