# Spark Leaderboard

Admin view for monitoring spark point leaderboards. Fetches from `GET /api/leaderboard?type=spark&limit=20`.

## Props

Takes no props (self-contained — fetches its own data via `fetchLeaderboard`).

## State

| State | Type | Default | Description |
|-------|------|---------|-------------|
| `leaders` | `array` | `[]` | Leaderboard entries |
| `loading` | `boolean` | `true` | Loading flag |
| `timeFilter` | `'today'\|'monthly'` | `'today'` | Toggle between two leaderboard views |

## Data Source

```ts
fetchLeaderboard({ type: 'spark', limit: 20 })
  .then(data => setLeaders(data))
```

Re-fetches on every `timeFilter` change.

## Leader Entry Shape

```ts
{
  userId:        string,
  displayName:   string,
  email:         string,
  score:         number,          // spark balance
  answersCount:  number,          // or: resolved
  upvotesReceived: number,        // or: upvotes
}
```

Fields are fallbacks: `leader.answersCount ?? leader.resolved ?? '—'`

## Medal Mapping

Top 3 entries get emoji medals (🥇🥈🥉). Rank 4+ gets zero-padded two-digit rank number.

## Metrics Strip

| Tile | Value |
|------|-------|
| Total Sparks Issued | `leaders.reduce((sum, l) => sum + (l.score || 0), 0)` |
| Top Earners Today | Sum of top 3 scores |
| Active Learners | `leaders.length` |

## Time Filter

`Monthly` / `Today` toggle in the table header. Both hit the same `type=spark` endpoint — the backend is expected to filter by time range based on the request.