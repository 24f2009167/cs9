import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react'
import { timeAgo } from '../../service'

function NotificationSidebar({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
}) {
  const navigate = useNavigate()
  const unread = notifications.filter(n => !n.is_read).length

  function handleItemClick(n) {
    if (!n.link) return
    if (n.link.startsWith('http')) {
      window.open(n.link, '_blank', 'noopener,noreferrer')
    } else {
      onClose()
      navigate(n.link)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[300]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-250"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="fixed inset-y-0 right-0 flex">
            <DialogPanel className="relative flex w-[360px] flex-col bg-white dark:bg-[#1a1d23] shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#3c4043] px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8c6a40] dark:bg-[#a0876a]">
                    <Bell className="h-4 w-4 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827] dark:text-[#e8eaed]">Notifications</p>
                    {unread > 0 && (
                      <p className="text-[11px] text-[#9ca3af] dark:text-[#6b7280]">{unread} unread</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onMarkAllRead && unread > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-semibold text-[#8c6a40] dark:text-[#a0876a] transition hover:bg-[#8c6a40]/10 dark:hover:bg-[#a0876a]/10"
                    >
                      <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9aa0a6] transition hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white focus:outline-none"
                  >
                    <X className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#22262e]">
                      <Bell className="h-6 w-6 text-[#d1d5db] dark:text-[#6b7280]" strokeWidth={1.5} />
                    </div>
                    <p className="text-[13px] font-medium text-[#374151] dark:text-[#9aa0a6]">No notifications yet</p>
                    <p className="mt-1 text-[12px] text-[#9ca3af] dark:text-[#6b7280]">
                      You'll see updates about your queries here.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map(n => (
                      <li
                        key={n.notification_id || n.id}
                        className={`flex gap-3 border-b border-[#f3f4f6] dark:border-[#2d3139] px-5 py-4 transition hover:bg-[#fafafa] dark:hover:bg-[#22262e] cursor-pointer ${
                          !n.is_read ? 'bg-[#fffdf5] dark:bg-[#1e2a38]' : 'bg-white dark:bg-[#1a1d23]'
                        }`}
                        onClick={() => handleItemClick(n)}
                      >
                        {/* Icon */}
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            !n.is_read
                              ? 'bg-[#8c6a40] dark:bg-[#a0876a] text-white'
                              : 'bg-[#f3f4f6] dark:bg-[#22262e] text-[#9ca3af] dark:text-[#6b7280]'
                          }`}
                        >
                          <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13px] leading-snug ${
                            !n.is_read
                              ? 'font-medium text-[#111827] dark:text-[#e8eaed]'
                              : 'text-[#444748] dark:text-[#9aa0a6]'
                          }`}>
                            {n.body || n.message || n.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-[#9ca3af] dark:text-[#6b7280]">
                              {n.created_at ? timeAgo(n.created_at) : ''}
                            </span>
                            {n.link && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#8c6a40] dark:text-[#a0876a]">
                                View <ExternalLink className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!n.is_read && (
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8c6a40] dark:bg-[#a0876a]" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DialogPanel>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}

export default NotificationSidebar