# FAQ Management

Admin view for monitoring FAQ content — shows FAQ entry count and recent FAQ records from the dashboard feed.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `dashboardData` | `object\|null` | Same object as `Dashboard` — accessed via `.metrics.questions.faq` and `.recent.questions` |

## Data Filtering

FAQ records are filtered client-side from `dashboardData.recent.questions`:
```ts
const faqQuestions = questions.filter(q => q.kind === 'faq')
```

## Metrics Strip

| Tile | Value source |
|------|-------------|
| FAQ Entries | `dashboardData.metrics.questions.faq` |
| Recent FAQ | `faqQuestions.length` (filtered from recent questions) |
| Status | Static — always shows `Synced` (green badge) |

## Recent FAQ Records

List rendered from `faqQuestions`. Each row shows:
- `question.title` — question title
- `question.status` — capitalized status label

Empty state: "No recent FAQ records in the admin feed."

## Placeholder UI

- **New FAQ button** — present but not wired (shows `notifyError` in a full implementation)