import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Search, Tag, X } from 'lucide-react'
import { styleForTag } from '../../constants'
import useThemeStore from '../../../../store/useThemeStore'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryTag {
  tag: string
  count: number
}

interface SearchModalProps {
  open: boolean
  categories?: CategoryTag[]
  initialSearch?: string
  initialTags?: string[]
  onApply?: (search: string, tags: string[]) => void
  onClose?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Search modal — keyword input + multi-select category (tag) chips.
 * Manages its own draft state, seeded from the committed values each
 * time it opens. Enter (or a category + Enter) applies; X closes without applying.
 */
const SearchModal: FC<SearchModalProps> = ({
  open,
  categories = [],
  initialSearch = '',
  initialTags = [],
  onApply,
  onClose,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [pendingTags, setPendingTags] = useState(initialTags)
  const inputRef = useRef<HTMLInputElement>(null)
  // The Dialog portals to <body>, outside the layout's invert wrapper, so the
  // panel must invert itself to stay in sync with dark mode.
  const isDark = useThemeStore(s => s.isDark)

  // Seed draft state when the modal opens
  useEffect(() => {
    if (open) {
      setSearchInput(initialSearch)
      setPendingTags(initialTags)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTag(tag: string) {
    setPendingTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    )
  }

  function apply() {
    onApply?.(searchInput.trim(), pendingTags)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      apply()
    }
  }

  return (
    <Dialog open={open} onClose={onClose ?? (() => {})} className="relative z-[2000]">
      <div className="fixed inset-0 flex items-start justify-center bg-black/40 pt-[120px] backdrop-blur-sm">
        <DialogPanel className={`flex w-full max-w-[1040px] flex-col rounded-2xl bg-white p-8 shadow-2xl${isDark ? ' theme-invert' : ''}`}>
          {/* Search input */}
          <div className="mb-8 flex items-center gap-3 rounded-xl border-2 border-[#8c6a40] bg-white px-5 py-3.5 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-[#8c6a40]" strokeWidth={1.8} />
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent text-[15px] text-[#191c1d] outline-none placeholder:text-[#9ca3af]"
              placeholder="Search FAQs, categories, or status…"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Selected-tag count indicator */}
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                pendingTags.length > 0 ? 'bg-[#8c6a40]/12 text-[#8c6a40]' : 'text-[#9ca3af]'
              }`}
              title={`${pendingTags.length} categor${pendingTags.length === 1 ? 'y' : 'ies'} selected`}
            >
              <Tag className="h-4 w-4" strokeWidth={1.8} />
              {pendingTags.length}
            </div>

            <span className="h-5 w-px shrink-0 bg-[#e5e7eb]" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 text-[#9ca3af] transition hover:text-[#191c1d]"
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Categories (tags from DB) */}
          <div className="mb-2 flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280]">Categories</span>
            <div className="h-px flex-1 bg-[#e5e7eb]" />
            {pendingTags.length > 0 && (
              <button
                type="button"
                onClick={() => setPendingTags([])}
                className="text-[11px] font-medium text-[#8c6a40] underline-offset-2 transition hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {categories.length === 0 ? (
            <p className="py-4 text-[12px] text-[#9ca3af]">No categories available yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-3">
              {categories.map(({ tag, count }) => {
                const { Icon, color, bg } = styleForTag(tag)
                const isSelected = pendingTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      isSelected ? 'border-[#8c6a40] bg-[#8c6a40]/5' : 'border-[#e5e7eb] hover:border-[#8c6a40]'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ background: bg, color }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                    <span className="text-[12px] font-semibold capitalize text-[#191c1d]">{tag}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        isSelected ? 'bg-[#8c6a40] text-white' : 'bg-[#f3f4f6] text-[#4b5563]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default SearchModal
