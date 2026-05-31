import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  Filter,
  MessageSquare,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Button from '../../../../components/Button/Button'

// Placeholder until GET /api/admin/dashboard returns metrics.charts.categories.
// Expected shape: [{ category: string, new: number, resolved: number }]
const PLACEHOLDER_CATEGORIES = [
  { category: 'Academic', new: 66, resolved: 42 },
  { category: 'NOC', new: 48, resolved: 72 },
  { category: 'VIBE', new: 82, resolved: 54 },
  { category: 'Stipend', new: 40, resolved: 62 },
  { category: 'Offer', new: 76, resolved: 88 },
  { category: 'Other', new: 58, resolved: 36 },
]

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0)
}

function MetricCard({ title, value, Icon, iconClassName, trend, trendType = 'up', badge }) {
  return (
    <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {badge ? (
          <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 text-[12px] font-bold ${
              trendType === 'down' ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {trendType === 'down' ? (
              <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.8} />
            )}
            {trend}
          </span>
        )}
      </div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-muted">{title}</p>
      <p className="text-[28px] font-semibold leading-none text-text-primary">{value}</p>
    </div>
  )
}

function ActivityItem({ icon: Icon, title, meta, tone = 'neutral' }) {
  const toneClass =
    tone === 'blue'
      ? 'bg-blue-100 text-blue-700'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-700'
        : tone === 'red'
          ? 'bg-red-100 text-red-700'
          : 'bg-bg-primary text-text-muted'

  return (
    <div className="flex gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-[11px] text-text-muted">{meta}</p>
      </div>
    </div>
  )
}

function DashboardView({ dashboardData, isLoading, onRefresh }) {
  const metrics = dashboardData?.metrics || {}
  const recent = dashboardData?.recent || {}
  const questionMetrics = metrics.questions || {}
  const usersMetrics = metrics.users || {}
  const flagsMetrics = metrics.flags || {}
  const recentQuestions = recent.questions || []
  const recentUsers = recent.users || []
  const recentFlags = recent.flags || []
  // Real data once the backend aggregation exists; placeholder until then.
  const categoryData = dashboardData?.charts?.categories?.length
    ? dashboardData.charts.categories
    : PLACEHOLDER_CATEGORIES
  const attentionRows = recentFlags.slice(0, 5)
  const activityItems = [
    ...recentQuestions.slice(0, 2).map((question) => ({
      id: `question-${question.question_id}`,
      icon: MessageSquare,
      title: `Question ${question.question_id?.slice(0, 8) || ''} needs review`,
      meta: `${question.kind || 'community'} | ${question.status || 'open'}`,
      tone: question.status === 'removed' ? 'red' : 'blue',
    })),
    ...recentUsers.slice(0, 2).map((user) => ({
      id: `user-${user.user_id}`,
      icon: UserPlus,
      title: `${user.name || 'New user'} joined`,
      meta: user.email || 'Recently created account',
      tone: 'amber',
    })),
    ...recentFlags.slice(0, 2).map((flag) => ({
      id: `flag-${flag.flag_id}`,
      icon: AlertCircle,
      title: `Flag opened for ${flag.target_type || 'content'}`,
      meta: flag.reason || flag.status || 'Pending moderation',
      tone: 'red',
    })),
  ]

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold leading-tight text-text-primary">
            Main Dashboard
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-text-secondary">
            Real-time platform metrics for the lab internship hub.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="gap-2 text-[12px]"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            Refresh
          </Button>
          <Button variant="secondary" className="gap-2 text-[12px]">
            <Download className="h-4 w-4" strokeWidth={1.8} />
            Export
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Community Queries"
          value={formatNumber(questionMetrics.community)}
          Icon={ClipboardList}
          iconClassName="bg-blue-50 text-blue-700"
          trend={`${formatNumber(questionMetrics.total)} total`}
        />
        <MetricCard
          title="FAQ Entries"
          value={formatNumber(questionMetrics.faq)}
          Icon={CheckCircle}
          iconClassName="bg-amber-50 text-amber-700"
          trend="Published"
        />
        <MetricCard
          title="Answers"
          value={formatNumber(metrics.answers?.total)}
          Icon={Clock}
          iconClassName="bg-violet-50 text-violet-700"
          trendType="down"
          trend="Live"
        />
        <MetricCard
          title="Open Flags"
          value={formatNumber(flagsMetrics.open)}
          Icon={AlertCircle}
          iconClassName="bg-red-50 text-red-600"
          badge={flagsMetrics.open > 0 ? 'URGENT' : 'CLEAR'}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[17px] font-bold text-text-primary">Query Volume by Category</h2>
            <div className="flex gap-4 text-[12px] text-text-muted">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> New
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-bg-tertiary" /> Resolved
              </span>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                barGap={4}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: '#111827' }}
                />
                <Bar dataKey="new" name="New" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="resolved" name="Resolved" fill="#d1d5db" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <h2 className="mb-6 text-[17px] font-bold text-text-primary">Resolver Activity</h2>
          <div className="flex flex-col gap-5">
            {activityItems.length === 0 ? (
              <p className="text-[13px] text-text-muted">No recent platform activity.</p>
            ) : (
              activityItems.map((item) => <ActivityItem key={item.id} {...item} />)
            )}
          </div>
          <button
            type="button"
            className="mt-6 w-full border-t border-border-light pt-4 text-center text-[13px] font-semibold text-blue-700 transition hover:text-blue-900"
          >
            View all activity
          </button>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-border-light bg-bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary">Needs Attention</h2>
            <p className="mt-1 text-[12px] text-text-muted">
              Showing {attentionRows.length} open moderation items
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-[12px] font-semibold text-text-muted transition hover:text-text-primary"
          >
            <Filter className="h-4 w-4" strokeWidth={1.8} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border-light bg-bg-tertiary text-left text-[11px] font-bold uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {attentionRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-text-muted" colSpan={5}>
                    No escalated items need attention.
                  </td>
                </tr>
              ) : (
                attentionRows.map((flag) => (
                  <tr key={flag.flag_id} className="border-b border-border-light last:border-b-0">
                    <td className="px-5 py-4 font-bold text-text-primary">
                      #{flag.flag_id?.slice(0, 8) || 'FLAG'}
                    </td>
                    <td className="px-5 py-4 capitalize text-text-secondary">
                      {flag.target_type || 'content'} {flag.target_id?.slice(0, 8) || ''}
                    </td>
                    <td className="max-w-[320px] truncate px-5 py-4 text-text-secondary">
                      {flag.reason || 'Pending review'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-700">
                        {flag.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {flag.reviewed_by || 'Admin queue'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-light bg-bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Users</p>
          <p className="mt-2 text-[22px] font-semibold text-text-primary">
            {formatNumber(usersMetrics.total)}
          </p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
            New this week
          </p>
          <p className="mt-2 text-[22px] font-semibold text-text-primary">
            {formatNumber(usersMetrics.thisWeek)}
          </p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
            Spark Ledger
          </p>
          <p className="mt-2 text-[22px] font-semibold text-text-primary">
            {formatNumber(metrics.sparks?.total)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
