import { useState } from 'react'
import {
  Popover, PopoverButton, PopoverPanel,
  Menu, MenuButton, MenuItems, MenuItem,
} from '@headlessui/react'
import { Settings, Search, SlidersHorizontal, PlusCircle, Bell, LogOut, Moon, Sun, Tag } from 'lucide-react'
import { timeAgo } from '../../service'
import Button from '../../../../components/Button/Button'

// Tag → icon/color map (matches SearchModal styleForTag)
function styleForTag(tag) {
  const map = {
    'DSA':           { color: '#8c6a40', bg: '#f5f0e8' },
    'Web Dev':       { color: '#3b82f6', bg: '#eff6ff' },
    'CP':            { color: '#f59e0b', bg: '#fffbeb' },
    'AI/ML':         { color: '#8b5cf6', bg: '#f5f3ff' },
    'Systems':       { color: '#64748b', bg: '#f8fafc' },
    'OS':            { color: '#16a34a', bg: '#f0fdf4' },
    'DBMS':          { color: '#0d9488', bg: '#f0fdfa' },
    'OOP':           { color: '#9333ea', bg: '#faf5ff' },
    'Aptitude':      { color: '#dc2626', bg: '#fef2f2' },
    'Interview Exp': { color: '#ca8a04', bg: '#fefce8' },
  }
  return map[tag] || { color: '#8c6a40', bg: '#f5f0e8' }
}

function DashboardHeader({
  user,
  initials,
  currentView,
  showRaiseQuery = true,
  notifications,
  unreadCount,
  isDark,
  onSearchOpen,
  onRaiseQuery,
  onNotifOpen,
  onNotifViewAll,
  onDarkToggle,
  onProfileSettings,
  onLogout,
  tags = [],
  selectedTags = [],
  onTagsChange,
}) {
  const [localTags, setLocalTags] = useState(selectedTags)

  function toggleTag(tag) {
    const next = localTags.includes(tag)
      ? localTags.filter(t => t !== tag)
      : [...localTags, tag]
    setLocalTags(next)
    onTagsChange?.(next)
  }

  function clearAll() {
    setLocalTags([])
    onTagsChange?.([])
  }

  const activeCount = localTags.length

  return (
    <header className="relative flex items-center justify-between border-b border-[#c4c7c7] dark:border-[#3c4043] bg-white dark:bg-[#1a1d23] px-8 py-4">

      {/* Search bar */}
      <div className="relative flex w-[420px] items-center gap-2 rounded-lg bg-[#edeeef] dark:bg-[#22262e] px-3 py-2 transition hover:bg-[#e5e6e7] dark:hover:bg-[#2a2e38]">
        <Search className="h-4 w-4 shrink-0 text-[#747878] dark:text-[#6b7280]" strokeWidth={1.8} />

        <input
          type="text"
          placeholder="Search FAQs, categories, or status…"
          className="flex-1 bg-transparent text-[12px] text-[#191c1d] dark:text-[#e8eaed] placeholder-[#747878] dark:placeholder-[#6b7280] outline-none"
          onChange={e => onSearchOpen?.(e.target.value)}
          onFocus={() => onSearchOpen?.('')}
        />

        <span className="h-4 w-px bg-[#c4c7c7] dark:bg-[#3c4043]" />

        {/* Filter — tag popover */}
        <Popover>
          <PopoverButton className="relative flex shrink-0 items-center gap-1 text-[#9ca3af] dark:text-[#6b7280] transition hover:text-[#191c1d] dark:hover:text-[#e8eaed]">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
            {activeCount > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8c6a40] dark:bg-[#a0876a] text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </PopoverButton>

          <div className="absolute left-0 top-full z-50 w-[280px]">
            <PopoverPanel className="mt-1 overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#3c4043] bg-white/95 dark:bg-[#1a1d23]/95 shadow-xl backdrop-blur-sm focus:outline-none">
              {/* Header row */}
              <div className="flex items-center justify-between border-b border-[#f3f4f6] dark:border-[#2d3139] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280] dark:text-[#9aa0a6]">
                    Categories
                  </span>
                  {activeCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8c6a40]/12 dark:bg-[#a0876a]/20 text-[10px] font-semibold text-[#8c6a40] dark:text-[#a0876a]">
                      {activeCount}
                    </span>
                  )}
                </div>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-medium text-[#8c6a40] dark:text-[#a0876a] underline-offset-2 transition hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Tag list */}
              <div className="flex flex-wrap gap-2 p-3">
                {tags.length === 0 ? (
                  <p className="py-2 text-[12px] text-[#9ca3af] dark:text-[#6b7280]">No categories yet.</p>
                ) : (
                  tags.map(({ tag, count }) => {
                    const { color, bg } = styleForTag(tag)
                    const isSelected = localTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[12px] font-medium transition hover:-translate-y-0.5 hover:shadow-sm ${
                          isSelected
                            ? 'border-[#8c6a40] dark:border-[#a0876a] bg-[#8c6a40]/5 dark:bg-[#a0876a]/10 text-[#8c6a40] dark:text-[#a0876a]'
                            : 'border-[#e5e7eb] dark:border-[#3c4043] text-[#444748] dark:text-[#9aa0a6] hover:border-[#8c6a40] dark:hover:border-[#a0876a] hover:text-[#8c6a40] dark:hover:text-[#a0876a]'
                        }`}
                      >
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded"
                          style={{ background: bg }}
                        >
                          <Tag className="h-3 w-3" strokeWidth={2} style={{ color }} />
                        </span>
                        {tag}
                        {count != null && (
                          <span className={`text-[10px] ${isSelected ? 'text-[#8c6a40]/70 dark:text-[#a0876a]/70' : 'text-[#9ca3af] dark:text-[#6b7280]'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </PopoverPanel>
          </div>
        </Popover>
      </div>

      {/* Right-side action group */}
      <div className="flex items-center gap-6">
        {showRaiseQuery && (
          <Button
            variant="secondary"
            className="gap-1.5 rounded-lg border-transparent bg-[#8c6a40]/80 dark:bg-[#a0876a]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white hover:border-transparent hover:bg-[#7a5c35] dark:hover:bg-[#8c7355]"
            onClick={onRaiseQuery}
          >
            <PlusCircle className="h-3.5 w-3.5" strokeWidth={1.8} /> Raise New Query
          </Button>
        )}

        {/* Bell */}
        <Popover className="relative">
          <PopoverButton
            onClick={() => onNotifOpen?.()}
            className="relative p-1 text-[#444748] dark:text-[#9aa0a6] transition hover:text-black dark:hover:text-white focus:outline-none"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </PopoverButton>

          <PopoverPanel className="absolute right-0 top-9 z-50 w-80 overflow-hidden rounded-lg border border-[#c4c7c7] dark:border-[#3c4043] bg-white dark:bg-[#1a1d23] shadow-lg focus:outline-none">
            <p className="border-b border-[#c4c7c7] dark:border-[#3c4043] px-4 py-3 text-[13px] font-semibold text-[#191c1d] dark:text-[#e8eaed]">
              Notifications
            </p>
            {notifications.length === 0 ? (
              <p className="px-4 py-5 text-center text-[12px] text-[#747878] dark:text-[#6b7280]">No notifications yet</p>
            ) : (
              notifications.slice(0, 3).map(n => (
                <div
                  key={n.notification_id || n.id}
                  className={`border-b border-[#f3f4f6] dark:border-[#2d3139] px-4 py-3 ${n.is_read ? 'bg-white dark:bg-[#1a1d23]' : 'bg-[#f0f9ff] dark:bg-[#1e2a38]'}`}
                >
                  <p className="mb-1 text-[12px] leading-snug text-[#444748] dark:text-[#9aa0a6]">{n.body || n.title}</p>
                  <span className="text-[10px] font-medium text-[#9ca3af] dark:text-[#6b7280]">
                    {n.created_at ? timeAgo(n.created_at) : ''}
                  </span>
                </div>
              ))
            )}
            <button
              type="button"
              onClick={onNotifViewAll}
              className="w-full cursor-pointer bg-[#f8f9fa] dark:bg-[#22262e] py-2.5 text-center text-[11px] font-semibold text-[#8c6a40] dark:text-[#a0876a] transition hover:bg-[#edeeef] dark:hover:bg-[#2a2e38]"
            >
              View All
            </button>
          </PopoverPanel>
        </Popover>

        {/* Dark mode toggle */}
        <button
          type="button"
          className="p-1 text-[#444748] dark:text-[#9aa0a6] transition hover:text-black dark:hover:text-white"
          onClick={() => onDarkToggle()}
        >
          {isDark
            ? <Sun  className="h-[18px] w-[18px]" strokeWidth={1.8} />
            : <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />}
        </button>

        {/* Divider */}
        <span className="h-8 w-px bg-[#c4c7c7] dark:bg-[#3c4043]" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-3 focus:outline-none">
            <div className="text-right leading-tight">
              <p className="text-[13px] font-medium capitalize text-[#191c1d] dark:text-[#e8eaed]">{user?.name || 'Student'}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#747878] dark:text-[#6b7280]">{user?.role || 'USER'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8c6a40] dark:bg-[#a0876a] text-[12px] font-bold text-white">
              {initials}
            </div>
          </MenuButton>

          <MenuItems className="absolute right-0 top-12 z-50 min-w-[160px] overflow-hidden rounded-lg border border-[#c4c7c7] dark:border-[#3c4043] bg-white dark:bg-[#1a1d23] shadow-lg focus:outline-none">
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-[#444748] dark:text-[#9aa0a6] transition data-focus:bg-[#f8f9fa] dark:data-focus:bg-[#22262e]"
                onClick={onProfileSettings}
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="text-[13px] font-medium capitalize">Profile Settings</span>
              </button>
            </MenuItem>
            <div className="h-px bg-[#c4c7c7] dark:bg-[#3c4043]" />
            <MenuItem>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-600 transition data-focus:bg-[#f8f9fa] dark:data-focus:bg-[#22262e]"
                onClick={onLogout}
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /> <span className="text-[13px] font-medium">Logout</span>
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  )
}

export default DashboardHeader