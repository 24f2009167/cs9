import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Trophy, Loader } from 'lucide-react'
import { fetchLeaderboard } from '../../service'

const TABS = [
  { key: 'spark',          label: 'Spark Points',     unit: 'pts' },
  { key: 'reputation',     label: 'Reputation',       unit: 'rep' },
  { key: 'acceptedAnswers', label: 'Accepted Answers', unit: 'answers' },
]

const MEDAL = {
  0: { ring: 'border-warning', badge: 'bg-warning', size: 'h-20 w-20 text-[24px]' },
  1: { ring: 'border-border', badge: 'bg-text-muted', size: 'h-16 w-16 text-[20px]' },
  2: { ring: 'border-warning', badge: 'bg-warning', size: 'h-16 w-16 text-[20px]' },
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function LeaderboardPage() {
  const { user } = useOutletContext()
  const [type, setType]       = useState('spark')
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await fetchLeaderboard({ type, limit: 20 }))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { load() }, [load])

  const unit = TABS.find(t => t.key === type)?.unit || 'pts'
  const podium = rows.slice(0, 3)
  const rest = rows.slice(3)
  // podium display order: 2nd, 1st, 3rd
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-[900px] px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display flex items-center gap-2 text-[22px] font-bold text-text-primary">
          <Trophy className="h-5 w-5 text-brand" strokeWidth={1.8} /> Leaderboard
        </h2>
        <p className="mt-1 text-[13px] text-text-muted">
          Top contributors across the internship community.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-7 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`mb-[-1px] pb-3 text-[13px] font-semibold transition ${
              type === t.key
                ? 'border-b-2 border-brand text-brand'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-[13px] text-text-muted">
          <Loader className="h-4 w-4 animate-spin" /> Loading leaderboard…
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-text-muted">No ranked contributors yet.</p>
      ) : (
        <>
          {/* Podium */}
          <div className="mb-10 flex items-end justify-center gap-6">
            {podiumOrder.map(entry => {
              const rank = rows.indexOf(entry)
              const m = MEDAL[rank]
              const isSelf = entry.userId === user?.userId
              return (
                <div key={entry.userId} className="flex flex-col items-center">
                  <div className="relative">
                    <div className={`flex items-center justify-center rounded-full border-[3px] bg-bg-primary font-bold text-text-primary ${m.ring} ${m.size}`}>
                      {initialsOf(entry.displayName)}
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-extrabold text-white ${m.badge}`}>
                      {rank + 1}
                    </div>
                  </div>
                  <p className={`mt-4 max-w-[120px] truncate text-center text-[13px] font-bold ${isSelf ? 'text-brand' : 'text-text-primary'}`}>
                    {isSelf ? 'You' : entry.displayName}
                  </p>
                  <p className="text-[12px] font-semibold text-text-muted">{entry.score} {unit}</p>
                </div>
              )
            })}
          </div>

          {/* Ranked list (4th onward) */}
          {rest.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
              {rest.map((entry, i) => {
                const rank = i + 4
                const isSelf = entry.userId === user?.userId
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 border-b border-border-light px-5 py-3 last:border-b-0 ${isSelf ? 'bg-brand/10' : ''}`}
                  >
                    <span className="w-6 text-[13px] font-bold text-text-muted">{rank}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1528] text-[12px] font-bold text-white">
                      {initialsOf(entry.displayName)}
                    </div>
                    <span className={`flex-1 text-[13px] font-medium ${isSelf ? 'text-brand' : 'text-text-primary'}`}>
                      {isSelf ? 'You' : entry.displayName}
                    </span>
                    <span className="text-[13px] font-bold text-text-primary">{entry.score}</span>
                    <span className="w-14 text-right text-[11px] font-medium uppercase tracking-wide text-text-muted">{unit}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LeaderboardPage
