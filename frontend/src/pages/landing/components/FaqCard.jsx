import { ChevronDown } from 'lucide-react'
import { parseMarkdown } from '../../../lib/markdown'

function getQuestionLabel(faq) {
  const rawQuestion = faq.question || ''
  return rawQuestion.replace(/^\s*\d+(?:\.\d+)*\s*/, '').trim()
}

function highlightText(text, search) {
  if (!search || !search.trim()) return text
  const cleanSearch = search.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const useWordBoundary = cleanSearch.length < 3 && /^\w/.test(cleanSearch)
  const regexStr = useWordBoundary ? `\\b(${cleanSearch})` : `(${cleanSearch})`
  const regex = new RegExp(regexStr, 'gi')
  return text.replace(regex, '<span class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 px-0.5 rounded font-semibold">$1</span>')
}

function highlightHtml(html, search) {
  if (!search || !search.trim()) return html
  const cleanSearch = search.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const useWordBoundary = cleanSearch.length < 3 && /^\w/.test(cleanSearch)
  const regexStr = useWordBoundary
    ? `(<[^>]*>)|\\b(${cleanSearch})`
    : `(<[^>]*>)|(${cleanSearch})`
  const regex = new RegExp(regexStr, 'gi')
  return html.replace(regex, (match, tag, term) => {
    if (tag) return tag
    return `<span class="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 px-0.5 rounded font-semibold">${term}</span>`
  })
}

function FaqCard({ faq, sectionId, isOpen, onToggle, searchQuery = '' }) {
  const answerId = `faq-answer-${sectionId}-${faq.id}`

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-bg-card transition">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
      >
        <span
          className="text-[14px] font-semibold leading-relaxed text-text-primary"
          dangerouslySetInnerHTML={{ __html: highlightText(getQuestionLabel(faq), searchQuery) }}
        />
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={1.8}
        />
      </button>
      <div
        id={answerId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="markdown-body px-4 pb-4 text-[13px] leading-6 text-text-secondary [&_a]:text-brand [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: highlightHtml(parseMarkdown(faq.answer || ''), searchQuery) }}
          />
        </div>
      </div>
    </article>
  )
}

export default FaqCard
