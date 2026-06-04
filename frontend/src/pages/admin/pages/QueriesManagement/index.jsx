import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  MessageSquare, ChevronUp, Zap, Tag, Pin, Lock, CheckCircle,
  Clock, User, ChevronLeft, ChevronRight, Loader, VenetianMask, Filter
} from 'lucide-react'
import { fetchAdminQuestions } from '../../service'

const PAGE_SIZE = 10

// status → badge classes (covers community + faq statuses)
const STATUS_STYLE = {
  unanswered: 'bg-amber-50 text-amber-700',
  answered:   'bg-blue-50 text-blue-700',
  closed:     'bg-gray-100 text-gray-600',
  removed:    'bg-red-50 text-red-700',
  draft:      'bg-gray-100 text-gray-600',
  published:  'bg-emerald-50 text-emerald-700',
  archived:   'bg-gray-100 text-gray-500',
}

const MOD_STYLE = {
  pending:  'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
}

function statusClass(status) {
  return STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function QueriesManagementView({ searchQuery = '', onOpenQuery }) {
  const location = useLocation()

  const [items, setItems]         = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  const [filterStatus, setFilterStatus] = useState(location.state?.status || '')
  const [filterKind, setFilterKind] = useState(location.state?.kind || '')
  const [filterId, setFilterId] = useState(location.state?.id || '')
  const [filterExpert, setFilterExpert] = useState(location.state?.expert || '')

  const [debouncedFilterId, setDebouncedFilterId] = useState(filterId)

  // Debounce header search and filterId; reset to page 1 whenever the term changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setDebouncedFilterId(filterId)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, filterId])
  
  useEffect(() => { setPage(1) }, [debouncedSearch, filterStatus, filterKind, debouncedFilterId, filterExpert])


  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { questions, pagination: meta } = await fetchAdminQuestions({
        page, limit: PAGE_SIZE, search: debouncedSearch,
        status: filterStatus, kind: filterKind, id: debouncedFilterId, hasExpertAnswer: filterExpert
      })
      setItems(questions)
      setPagination(meta)
    } catch {
      setItems([])
      setPagination({ page: 1, pages: 0, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filterStatus, filterKind, debouncedFilterId, filterExpert])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, pagination.pages || 1)

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold text-text-primary">
            Queries Management
          </h1>
          <p className="mt-2 text-[13px] text-text-secondary">
            Review all platform questions across every status and kind.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border-light bg-bg-card p-1 shadow-sm">
            <Filter className="ml-2 h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
            <input
              type="text"
              placeholder="Ticket ID..."
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="h-7 w-24 bg-transparent px-2 text-[12px] font-medium text-text-primary outline-none placeholder:font-normal"
            />
            <div className="h-4 w-px bg-border-light" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-7 cursor-pointer bg-transparent px-2 text-[12px] font-medium text-text-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="unanswered">Unanswered</option>
              <option value="answered">Answered</option>
              <option value="closed">Resolved (Closed)</option>
              <option value="removed">Removed</option>
            </select>
            <div className="h-4 w-px bg-border-light" />
            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
              className="h-7 cursor-pointer bg-transparent px-2 text-[12px] font-medium text-text-primary outline-none"
            >
              <option value="">All Kinds</option>
              <option value="community">Community</option>
              <option value="faq">FAQ</option>
            </select>
            <div className="h-4 w-px bg-border-light" />
            <select
              value={filterExpert}
              onChange={(e) => setFilterExpert(e.target.value)}
              className="h-7 cursor-pointer bg-transparent px-2 text-[12px] font-medium text-text-primary outline-none pr-1"
            >
              <option value="">Any Expert</option>
              <option value="true">Expert Answered</option>
              <option value="false">No Expert</option>
            </select>
          </div>
          
          <span className="rounded-full bg-bg-tertiary px-3 py-1.5 text-[12px] font-semibold text-text-muted">
            {pagination.total} total
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-text-muted">
          <Loader className="h-4 w-4 animate-spin" /> Loading queries…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-[13px] text-text-muted">
          <MessageSquare className="h-8 w-8 text-[#d1d5db]" strokeWidth={1.5} />
          {debouncedSearch.trim() ? `No queries match “${debouncedSearch.trim()}”.` : 'No queries yet.'}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((q) => {
              const author = q.is_anonymous ? 'Anonymous' : (q.author_name || q.author_id?.slice(0, 8) || 'Unknown')
              const preview = stripHtml(q.body)
              return (
                <article
                  key={q.question_id}
                  onClick={() => onOpenQuery?.(q.question_id)}
                  className="cursor-pointer rounded-xl border border-border-light bg-bg-card p-5 shadow-sm transition hover:border-brand hover:shadow-md"
                >
                  {/* Top row: id + badges */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-text-muted">
                      #{q.question_id?.slice(0, 8)}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${q.kind === 'faq' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {q.kind || 'community'}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(q.status)}`}>
                      {q.status}
                    </span>
                    {q.is_anonymous && (
                      <span className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                        <VenetianMask className="h-3 w-3" strokeWidth={2.2} /> Anonymous
                      </span>
                    )}
                    {q.moderation_status && q.moderation_status !== 'approved' && (
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${MOD_STYLE[q.moderation_status] || 'bg-gray-100 text-gray-600'}`}>
                        {q.moderation_status}
                      </span>
                    )}
                    {q.is_pinned && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-brand">
                        <Pin className="h-3 w-3" strokeWidth={2} /> Pinned
                      </span>
                    )}
                    {q.is_locked && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-text-muted">
                        <Lock className="h-3 w-3" strokeWidth={2} /> Locked
                      </span>
                    )}
                    {q.has_expert_answer && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle className="h-3 w-3" strokeWidth={2} /> Expert answer
                      </span>
                    )}
                    {q.spark_bounty > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <Zap className="h-3 w-3" strokeWidth={2} /> {q.spark_bounty}
                      </span>
                    )}
                  </div>

                  {/* Title + preview */}
                  <h3 className="font-display text-[16px] font-semibold text-text-primary">{q.title}</h3>
                  {preview && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-text-secondary">{preview}</p>
                  )}

                  {/* Tags */}
                  {(q.tags || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 rounded bg-bg-tertiary px-2 py-0.5 text-[10px] font-medium capitalize text-text-muted">
                          <Tag className="h-2.5 w-2.5" strokeWidth={2} /> {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta + stats */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border-light pt-3 text-[11px] font-medium text-text-muted">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" strokeWidth={1.8} /> {author}</span>
                    <span className="flex items-center gap-1"><ChevronUp className="h-3.5 w-3.5" strokeWidth={1.8} /> {q.upvotes ?? 0} upvotes</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" strokeWidth={1.8} /> {q.answer_count ?? 0} answers</span>
                    {q.assigned_to && (
                      <span className="flex items-center gap-1 text-brand">Assigned: {q.assigned_to.slice(0, 8)}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" strokeWidth={1.8} /> {formatDate(q.created_at)}</span>
                    {/* Only show "active" when it lands on a different day than created */}
                    {formatDate(q.last_activity_at) !== formatDate(q.created_at) && (
                      <span className="text-text-muted">· active {formatDate(q.last_activity_at)}</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pagination (server-driven) */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-light disabled:hover:text-text-muted"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <span className="text-[11px] font-medium text-text-muted">
                {pagination.page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
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
  )
}

export default QueriesManagementView
