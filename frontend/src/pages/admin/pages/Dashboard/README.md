# Dashboard

Main admin dashboard — platform metrics, query volume chart, resolver activity feed, and moderation attention table.

Lazy-loaded in `AdminHome` (`React.lazy`) to defer the Recharts bundle from the initial load.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `dashboardData` | `object\|null` | Fetched from `GET /api/admin/dashboard`. Shape: `{ metrics, recent, charts }` |
| `isLoading` | `boolean` | Controls the Refresh button spinner |
| `onRefresh` | `fn` | Re-fetches dashboard data (calls `fetchAdminDashboard`) |
| `searchQuery` | `string` | (Accepted but not used in this view) |

## Data Shape

```ts
{
  metrics: {
    questions: { community: number, faq: number, total: number },
    answers:   { total: number },
    flags:     { open: number },
    users:     { total: number, thisWeek: number },
    sparks:    { total: number },
  },
  recent: {
    questions: Question[],
    users:     User[],
    flags:     Flag[],
  },
  charts: {
    categories: Array<{ category: string, new: number, resolved: number }>
  }
}
```

## Sub-components

### `MetricCard`

Displays a single KPI tile (icon, value, trend).

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Label (uppercase, tracking-wide) |
| `value` | `string\|number` | Formatted large number |
| `Icon` | `lucide icon` | Icon component rendered inside colored box |
| `iconClassName` | `string` | Background + text color classes |
| `trend` | `string` | Secondary metric shown below value |
| `trendType` | `'up'\|'down'` | Green for up, red for down |
| `badge` | `string` | Overrides trend — shown instead (e.g. `URGENT`) |

### `ActivityItem`

Single activity feed row with colored icon, title, and metadata.

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `lucide icon` | Left-side icon |
| `title` | `string` | Bold row title |
| `meta` | `string` | Secondary metadata below title |
| `tone` | `'blue'\|'amber'\|'red'\|'neutral'` | Controls icon background color |

## Layout Sections

1. **KPI strip** — 4 `MetricCard` tiles: Community Queries, FAQ Entries, Answers, Open Flags
2. **Query Volume chart** — Recharts `BarChart` showing `new` vs `resolved` per category. Falls back to `PLACEHOLDER_CATEGORIES` if backend doesn't return `charts.categories`
3. **Resolver Activity feed** — `ActivityItem` rows (recent questions, new users, flags), max 6 total
4. **Needs Attention table** — first 5 open flags with ID, target, reason, status, reviewer
5. **Bottom metrics** — Users total, New this week, Spark Ledger (3-column strip)

## Refresh

`onRefresh` is called on the Refresh button click. `isLoading` disables the button and spins the icon.