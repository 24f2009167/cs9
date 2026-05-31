# Admin Panel

Top-level shell and page structure for the admin dashboard.

## Entry Point

**`index.jsx`** — `AdminHome`

The root admin component. Owns all shared state and renders the admin shell.

### State

| State | Type | Purpose |
|-------|------|---------|
| `currentAdminView` | `string` | Active view name — one of: `dashboard`, `queriesManagement`, `sparkLeaderboard`, `faqManagement`, `adminProfile` |
| `dashboardData` | `object\|null` | Fetched via `GET /api/admin/dashboard` on mount |
| `isDashboardLoading` | `boolean` | Loading flag for dashboard data |
| `notifications` | `array` | Admin notification list |
| `unreadCount` | `number` | Unread notification count (red dot on bell) |
| `searchQuery` | `string` | Header search input value |

### Views

| View | Component | Lazy? |
|------|-----------|-------|
| `dashboard` | `DashboardView` (lazy) | Yes — Recharts deferred |
| `queriesManagement` | `QueriesManagementView` | No |
| `sparkLeaderboard` | `SparkLeaderboardView` | No |
| `faqManagement` | `FAQManagementView` | No |
| `adminProfile` | `AdminProfileView` | No |

### Key Flows

- **Notifications** — clicking bell calls `markAllAdminNotificationsRead()` and clears local `unreadCount`
- **Search** — submit triggers `navigate('queriesManagement')` (view switch), `searchQuery` is passed to `QueriesManagementView` for filtering
- **Theme** — `useThemeStore` persists dark/light preference; `theme-invert` class on root div applies CSS-variable inversion
- **Logout** — calls `logoutAdmin()` API, clears auth store, navigates to `/`

### Props passed to all page views (via spread `viewProps`)

```ts
{ dashboardData: object, isLoading: boolean, searchQuery: string, onRefresh: fn }
```

## Sub-pages

- [Dashboard](./pages/Dashboard/) — metrics, charts, activity feed, attention table
- [FAQ Management](./pages/FAQManagement/) — FAQ metrics and record list
- [Queries Management](./pages/QueriesManagement/) — searchable queries table
- [Spark Leaderboard](./pages/SparkLeaderboard/) — spark rankings
- [Admin Profile](./pages/AdminProfile/) — profile + password settings

## Components

- [Header](./components/Header/AdminHeader.jsx) — top bar with search, bell, dark toggle, user menu
- [LeftPane](./components/LeftPane/AdminLeftPane.jsx) — sidebar with project branding and nav