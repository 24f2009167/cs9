import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, CheckCircle2, Clock, HelpCircle, ChevronUp } from 'lucide-react'
import QuestionCard from '../../components/QuestionCard/QuestionCard'
import { fetchMyContributions, fetchQuestions, normalizeQuestion } from '../../service'
import { notifyError } from '../../../../lib/notify'
import useAuthStore from '../../../../store/useAuthStore'

// ─── Types ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  question: { icon: HelpCircle,   label: 'Question', color: '#8c6a40' },
  answer:   { icon: CheckCircle2, label: 'Answer',  color: '#16a34a' },
  comment:  { icon: MessageSquare, label: 'Comment', color: '#2563eb' },
}

// ─── Component ─────────────────────────────────────────────────────────────

function MyContributionsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [contributions, setContributions] = useState([])
  const [normalizedQuestions, setNormalizedQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'questions' | 'answers' | 'comments'
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)

  const tabs = [
    { key: 'all',      label: 'All' },
    { key: 'questions', label: 'Questions' },
    { key: 'answers',  label: 'Answers' },
    { key: 'comments', label: 'Comments' },
  ]

  // Load all contributions on mount
  useEffect(() => {
    if (!user?.userId) return
    setLoading(true)
    fetchMyContributions()
      .then(data => setContributions(data.contributions || []))
      .catch(() => notifyError('Could not load your contributions.'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  // When a question-type contribution is clicked, fetch its full detail
  useEffect(() => {
    if (!selectedId) return
    setLoadingDetail(true)
    fetchQuestions({ questionId: selectedId })
      .then(data => {
        const q = Array.isArray(data.questions) ? data.questions[0] : data
        setDetail(q ? normalizeQuestion(q, user?.userId) : null)
      })
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false))
  }, [selectedId, user?.userId])

  const filtered = contributions.filter(c => {
    if (activeTab === 'all')       return true
    if (activeTab === 'questions') return c.type === 'question'
    if (activeTab === 'answers')   return c.type === 'answer'
    if (activeTab === 'comments')  return c.type === 'comment'
    return true
  })

  function handleCardClick(id) {
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setSelectedId(null)
    setDetail(null)
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  if (selectedId && detail) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-8 py-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 flex items-center gap-2 text-[13px] font-medium text-[#8c6a40] transition hover:text-[#6b5230]"
        >
          ← Back to all contributions
        </button>
        <QuestionCard
          query={detail}
          onUpvote={() => {}}
          onClick={() => {}}
        />
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c4c7c7] border-t-[#8c6a40]" />
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (contributions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#edeeef]">
          <MessageSquare className="h-7 w-7 text-[#9ca3af]" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 font-display text-[20px] font-bold text-[#191c1d]">No contributions yet</h3>
        <p className="mb-6 text-[13px] text-[#6b7280]">
          Raise a query or answer a question to see your activity here.
        </p>
        <button
          type="button"
          onClick={() => navigate('/raise-query')}
          className="rounded-lg bg-[#0b1528] px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1e293b]"
        >
          Raise a Query
        </button>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[900px] px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold text-[#191c1d]">My Contributions</h2>
        <span className="text-[12px] text-[#9ca3af]">{contributions.length} total</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[#edeeef] p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
              activeTab === tab.key
                ? 'bg-white text-[#191c1d] shadow-sm'
                : 'text-[#6b7280] hover:text-[#191c1d]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[#9ca3af]">
            No {activeTab} to show.
          </p>
        ) : (
          filtered.map(item => {
            const { icon: Icon, label, color } = TYPE_META[item.type] ?? TYPE_META.question
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex cursor-pointer items-start gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#8c6a40] hover:shadow-sm"
                onClick={() => item.type === 'question' && handleCardClick(item.id)}
              >
                {/* Type badge */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}15`, color }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ background: `${color}15`, color }}
                    >
                      {label}
                    </span>
                    {item.type === 'answer' && item.isAccepted && (
                      <span className="flex items-center gap-1 rounded bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Accepted
                      </span>
                    )}
                    {item.type === 'question' && (
                      <span className="flex items-center gap-1 text-[11px] text-[#9ca3af]">
                        <Clock className="h-3 w-3" strokeWidth={1.8} />
                        {new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {item.type === 'question' ? (
                    <h4 className="mb-1 text-[15px] font-semibold text-[#191c1d]">{item.title}</h4>
                  ) : null}

                  <p
                    className="line-clamp-2 text-[13px] leading-5 text-[#6b7280]"
                    dangerouslySetInnerHTML={{ __html: item.body || '' }}
                  />

                  {/* Footer meta */}
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-[#9ca3af]">
                    {item.score > 0 && (
                      <span className="flex items-center gap-1">
                        <ChevronUp className="h-3 w-3" strokeWidth={2} />
                        {item.score}
                      </span>
                    )}
                    {item.type === 'answer' && item.questionId && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleCardClick(item.questionId) }}
                        className="text-[#8c6a40] underline-offset-2 transition hover:underline"
                      >
                        View question →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MyContributionsPage
