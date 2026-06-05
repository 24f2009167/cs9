import { useState, useEffect } from 'react'
import { axisPrivate } from '../../../../api/axios'
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  HelpCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Button from '../../../../components/Button/Button'

function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0)
}

function MetricCard({ title, value, Icon, iconClassName, trend, trendType = 'up', badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border-light bg-bg-card p-5 shadow-sm ${onClick ? 'cursor-pointer transition hover:border-brand hover:shadow-md' : ''}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {badge ? (
          <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white dark:bg-red-500/15 dark:text-red-300">
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


function DashboardView({ dashboardData, isLoading, onRefresh, onNavigate, onOpenQuery }) {
  const metrics = dashboardData?.metrics || {}
  const questionMetrics = metrics.questions || {}
  const usersMetrics = metrics.users || {}
  const flagsMetrics = metrics.flags || {}
  const resolutionSpeedData = dashboardData?.charts?.resolutionSpeed || []
  const supportLoadData = dashboardData?.charts?.supportLoad || []
  const categoryData = dashboardData?.charts?.categories || []

  const [unresolvedQueries, setUnresolvedQueries] = useState([])
  const [unresolvedCount, setUnresolvedCount] = useState(0)

  useEffect(() => {
    let active = true
    async function fetchUnresolved() {
      try {
        const { data } = await axisPrivate().get('/api/questions?status=unanswered&limit=5')
        if (active && data) {
          setUnresolvedQueries(data.questions || [])
          setUnresolvedCount(data.pagination?.total || 0)
        }
      } catch (err) {
        console.error('Failed to fetch unresolved queries', err)
      }
    }
    fetchUnresolved()
    return () => { active = false }
  }, [])


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

      <div data-tour="admin-kpis" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Community Queries"
          value={formatNumber(questionMetrics.community)}
          Icon={ClipboardList}
          iconClassName="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
          trend={`${formatNumber(questionMetrics.total)} total`}
          onClick={() => onNavigate('queriesManagement')}
        />
        <MetricCard
          title="FAQ Entries"
          value={formatNumber(questionMetrics.faq)}
          Icon={CheckCircle}
          iconClassName="bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-200"
          trend="Published"
          onClick={() => onNavigate('faqManagement')}
        />
        <MetricCard
          title="Under approval"
          value={formatNumber(metrics.seekApproval?.total)}
          Icon={Clock}
          iconClassName="bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-200"
          trendType="up"
          trend="Pending"
          onClick={() => onNavigate('queriesManagement', { state: { hasApproval: 'true' } })}
        />
        <MetricCard
          title="Open Flags"
          value={formatNumber(flagsMetrics.open)}
          Icon={AlertCircle}
          iconClassName="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-200"
          badge={flagsMetrics.open > 0 ? 'URGENT' : 'CLEAR'}
          onClick={onNavigate ? () => onNavigate('flagModeration') : undefined}
        />
      </div>

      <section data-tour="admin-unresolved" className="mb-8 overflow-hidden rounded-lg border border-border-light bg-bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-text-primary">Unresolved Queries</h2>
            <p className="mt-1 text-[12px] text-text-muted">
              Showing {unresolvedQueries.length} of {formatNumber(unresolvedCount)} open queries
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('queriesManagement', { state: { status: 'unanswered' } })}
            className="flex items-center gap-2 text-[12px] font-semibold text-brand transition hover:text-brand-hover"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={1.8} />
            View all queries
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border-light bg-bg-tertiary text-left text-[11px] font-bold uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Author</th>
              </tr>
            </thead>
            <tbody>
              {unresolvedQueries.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-text-muted" colSpan={4}>
                    No unresolved queries.
                  </td>
                </tr>
              ) : (
                unresolvedQueries.map((q) => (
                  <tr 
                    key={q.question_id} 
                    className="border-b border-border-light last:border-b-0 cursor-pointer hover:bg-bg-secondary transition"
                    onClick={() => onOpenQuery?.(q.question_id)}
                  >
                    <td className="px-5 py-4 font-bold text-text-primary">
                      #{q.question_id?.slice(0, 8)}
                    </td>
                    <td className="max-w-[320px] truncate px-5 py-4 text-text-secondary font-medium">
                      {q.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase text-orange-700">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {q.author_name || 'User'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>







      <div data-tour="admin-stats-summary" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div data-tour="admin-charts" className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-text-primary">Resolution Speed (SLA Health)</h2>
              <p className="mt-1 text-[12px] text-text-muted">Time taken to resolve questions (lower is better).</p>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resolutionSpeedData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                barGap={4}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-light)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-bg-secondary)' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: 'var(--color-text-primary)' }}
                />
                <Bar dataKey="count" name="Questions" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-text-primary">Community Independence</h2>
              <p className="mt-1 text-[12px] text-text-muted">Answers provided by role (shows self-sustainability).</p>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supportLoadData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {supportLoadData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'ADMIN' ? '#f43f5e' : entry.name === 'RESOLVER' ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', fontSize: 12 }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>


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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-light)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-bg-secondary)' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: 'var(--color-text-primary)' }}
                />
                <Bar dataKey="new" name="New" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="resolved" name="Resolved" fill="#d1d5db" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-text-primary">Last 24hrs Traffic</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <Clock className="h-3 w-3" strokeWidth={1.8} />
              <span>Hourly</span>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData?.last24h || []}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-light)' }}
                  tickFormatter={val => val.split(' ')[1]?.slice(0, 5) || val}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border-light)', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: 'var(--color-text-primary)' }}
                  labelFormatter={val => val}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="questions"
                  name="Questions"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="answers"
                  name="Answers & Comments"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardView
