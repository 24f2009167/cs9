import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Trophy, Loader, Search, X } from 'lucide-react'
import { fetchLeaderboard } from '../../service'

const TABS = [
  { key: 'spark',          label: 'Spark Points',     unit: 'pts' },
  { key: 'reputation',     label: 'Reputation',       unit: 'rep' },
  { key: 'acceptedAnswers', label: 'Accepted Answers', unit: 'answers' },
]

// Gold / silver / bronze, keyed by rank index (0 = 1st). The #1 avatar is larger.
const MEDAL = {
  0: { ring: 'border-[#d4af37]', badge: 'bg-[#d4af37]', size: 'h-20 w-20 text-[24px]' }, // gold
  1: { ring: 'border-[#9ca3af]', badge: 'bg-[#9ca3af]', size: 'h-16 w-16 text-[20px]' }, // silver
  2: { ring: 'border-[#cd7f32]', badge: 'bg-[#cd7f32]', size: 'h-16 w-16 text-[20px]' }, // bronze
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function RankRow({ rank, entry, unit, isSelf }) {
  return (
    <div className={`flex items-center gap-4 border-b border-border-light px-5 py-3 last:border-b-0 ${isSelf ? 'bg-brand/10' : ''}`}>
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
}

function LeaderboardPage() {
  const { user } = useOutletContext()
  const [type, setType]       = useState('spark')
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch]   = useState('')
  const searchRef = useRef(null)

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

  // Active search collapses the podium into a flat list of name matches,
  // preserving each contributor's true rank.
  const q = search.trim().toLowerCase()
  const matches = q
    ? rows
        .map((entry, idx) => ({ entry, rank: idx + 1 }))
        .filter(({ entry }) => (entry.displayName || '').toLowerCase().includes(q))
    : null

  const openSearch = () => {
    setSearchOpen(true)
    requestAnimationFrame(() => searchRef.current?.focus())
  }
  const closeSearch = () => {
    setSearchOpen(false)
    setSearch('')
  }

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

      {/* Tabs + search */}
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border">
        <div className="flex gap-7">
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

        <div className="flex items-center gap-1 pb-2">
          <div
            className={`flex items-center overflow-hidden transition-all duration-200 ${
              searchOpen ? 'w-44 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') closeSearch() }}
              placeholder="Search by name…"
              className="w-full rounded-md border border-border bg-bg-card px-3 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label={searchOpen ? 'Close search' : 'Search contributors'}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-hover-bg hover:text-text-primary"
          >
            {searchOpen ? <X className="h-4 w-4" strokeWidth={1.8} /> : <Search className="h-4 w-4" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-[13px] text-text-muted">
          <Loader className="h-4 w-4 animate-spin" /> Loading leaderboard…
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-text-muted">No ranked contributors yet.</p>
      ) : matches ? (
        matches.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-text-muted">
            No contributors match &ldquo;{search.trim()}&rdquo;.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
            {matches.map(({ entry, rank }) => (
              <RankRow
                key={entry.userId}
                rank={rank}
                entry={entry}
                unit={unit}
                isSelf={entry.userId === user?.userId}
              />
            ))}
          </div>
        )
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
              {rest.map((entry, i) => (
                <RankRow
                  key={entry.userId}
                  rank={i + 4}
                  entry={entry}
                  unit={unit}
                  isSelf={entry.userId === user?.userId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LeaderboardPage
