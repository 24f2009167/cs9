import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Award, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchLeaderboard } from '../../../user/service'

const SPARK_ICONS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

const WINDOW_TABS = [
  { key: 'all',     label: 'All-time' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'today',   label: 'Today' },
]

const TOTAL_LABEL = {
  all:     'All-Time Spark Total',
  monthly: 'Sparks This Month',
  today:   'Sparks Today',
}

const PAGE_SIZE = 10

function SparkLeaderboardView() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeWindow, setTimeWindow] = useState('all') // 'all' | 'monthly' | 'today'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchLeaderboard({ type: 'spark', limit: 20, window: timeWindow })
      .then(data => { if (active) setLeaders(data) })
      .catch(() => { if (active) setLeaders([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [timeWindow])

  // Attach true leaderboard rank before filtering, then search by name.
  const ranked = leaders.map((leader, index) => ({ ...leader, rank: index + 1 }))
  const q = search.trim().toLowerCase()
  const filtered = q
    ? ranked.filter(l => (l.displayName || '').toLowerCase().includes(q))
    : ranked

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when the result set changes; clamp if it shrinks.
  useEffect(() => { setPage(1) }, [timeWindow, search])
  useEffect(() => { setPage(p => Math.min(p, totalPages)) }, [totalPages])

  const totalSparks = leaders.reduce((sum, l) => sum + (l.score || 0), 0)
  const topEarner = leaders[0]

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Zap className="h-5 w-5 text-amber-500" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="font-display text-[24px] font-semibold text-text-primary">Spark Leaderboard</h1>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-text-secondary">
          Recognising academic rigour and community contribution. Ranked by spark points earned through helpful answers, accepted solutions, and peer support.
        </p>
      </div>

      {/* Metric strip */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{TOTAL_LABEL[timeWindow]}</p>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">
            {totalSparks.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Top Earner</p>
            <Award className="h-4 w-4 text-amber-500" strokeWidth={1.8} />
          </div>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">
            {topEarner ? (topEarner.score || 0).toLocaleString('en-IN') : '—'}
          </p>
          {topEarner && (
            <p className="mt-1 truncate text-[12px] text-text-muted">{topEarner.displayName}</p>
          )}
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Ranked Contributors</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={1.8} />
          </div>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">{leaders.length}</p>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="rounded-xl border border-border-light bg-bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[16px] font-bold text-text-primary">Top Contributors</h2>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="w-44 rounded-lg border border-border bg-bg-card py-1.5 pl-8 pr-3 text-[12px] text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
            {/* Time window */}
            <div className="flex gap-2 rounded-lg bg-bg-primary p-1">
              {WINDOW_TABS.map(w => (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setTimeWindow(w.key)}
                  className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
                    timeWindow === w.key
                      ? 'bg-bg-card text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
            Loading leaderboard…
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[13px] text-text-muted">
            <Zap className="mb-2 h-8 w-8 text-[#d1d5db]" strokeWidth={1.5} />
            No spark data yet. Sparks are earned when users answer questions and receive upvotes.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-muted">
            No contributors match “{search.trim()}”.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border-light bg-bg-tertiary text-left text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Scholar</th>
                    <th className="px-5 py-3">Questions Answered</th>
                    <th className="px-5 py-3">Upvotes Received</th>
                    <th className="px-5 py-3">Spark Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {pageRows.map((leader) => {
                    const medal = SPARK_ICONS[leader.rank]
                    return (
                      <tr key={leader.userId || leader.rank} className="transition hover:bg-bg-tertiary">
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1">
                            {medal ? (
                              <span className="text-[16px]">{medal}</span>
                            ) : (
                              <span className="w-5 text-center font-display text-[18px] font-bold text-text-muted">
                                {String(leader.rank).padStart(2, '0')}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                              {(leader.displayName || 'U')
                                .trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-text-primary">
                                {leader.displayName || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                          {leader.answersCount ?? 0}
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                          {leader.upvotesReceived ?? 0}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-bold text-amber-700">
                            ⚡ {(leader.score || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 border-t border-border-light px-5 py-4">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-light disabled:hover:text-text-muted"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <span className="text-[11px] font-medium text-text-muted">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-light disabled:hover:text-text-muted"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SparkLeaderboardView
