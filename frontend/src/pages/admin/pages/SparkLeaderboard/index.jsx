import { useEffect, useState } from 'react'
import { Zap, TrendingUp } from 'lucide-react'
import { fetchLeaderboard } from '../../../user/service'

const SPARK_ICONS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

function SparkLeaderboardView() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('today') // 'today' | 'monthly'

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard({ type: 'spark', limit: 20 })
      .then(data => setLeaders(data))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false))
  }, [timeFilter])

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
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Total Sparks Issued</p>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">
            {leaders.reduce((sum, l) => sum + (l.score || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Top Earners Today</p>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">
            {leaders.slice(0, 3).reduce((sum, l) => sum + (l.score || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Active Learners</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={1.8} />
          </div>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">{leaders.length}</p>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="rounded-xl border border-border-light bg-bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <h2 className="text-[16px] font-bold text-text-primary">Top Contributors</h2>
          <div className="flex gap-2 rounded-lg bg-bg-primary p-1">
            {['Monthly', 'Today'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setTimeFilter(f.toLowerCase())}
                className={`rounded-md px-3 py-1 text-[11px] font-semibold transition ${
                  timeFilter === f.toLowerCase()
                    ? 'bg-bg-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
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
        ) : (
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
              <tbody className="divide-y divide-[#f3f4f6]">
                {leaders.map((leader, index) => {
                  const medal = SPARK_ICONS[index + 1]
                  return (
                    <tr
                      key={leader.userId || index}
                      className="hover:bg-bg-tertiary transition"
                    >
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1">
                          {medal ? (
                            <span className="text-[16px]">{medal}</span>
                          ) : (
                            <span className="w-5 text-center font-display text-[18px] font-bold text-text-muted">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                            {(leader.displayName || leader.name || 'U')
                              .trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">
                              {leader.displayName || leader.name || 'Unknown'}
                            </p>
                            <p className="text-[11px] text-text-muted">{leader.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {leader.answersCount ?? leader.resolved ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {leader.upvotesReceived ?? leader.upvotes ?? '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-bold text-amber-700">
                          ⚡ {leader.score?.toLocaleString('en-IN') ?? leader.sparkBalance?.toLocaleString('en-IN') ?? 0}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SparkLeaderboardView