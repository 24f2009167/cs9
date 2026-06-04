import { Fragment } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react'
import { timeAgo } from '@/pages/user/service'
import type { AppNotification } from '@/pages/user/components/NotifSidebar/NotificationSidebar'

interface AdminNotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
  notifications?: AppNotification[]
  onMarkAllRead?: () => void
  onNavigate: (link: string) => void
}

function AdminNotificationSidebar({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onNavigate,
}: AdminNotificationSidebarProps) {
  const unread = notifications.filter(n => !n.is_read).length

  function handleItemClick(n: AppNotification) {
    if (!n.link) return
    if (n.link.startsWith('http')) {
      window.open(n.link, '_blank', 'noopener,noreferrer')
    } else {
      onClose()
      onNavigate(n.link)
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
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
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
            <DialogPanel className="relative flex w-[360px] flex-col bg-bg-card shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand">
                    <Bell className="h-4 w-4 text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-text-primary">Notifications</p>
                    {unread > 0 && (
                      <p className="text-[11px] text-text-muted">{unread} unread</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onMarkAllRead && unread > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-semibold text-brand transition hover:bg-brand/10"
                    >
                      <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition hover:bg-black/5 hover:text-text-primary focus:outline-none"
                  >
                    <X className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-primary">
                      <Bell className="h-6 w-6 text-[#d1d5db]" strokeWidth={1.5} />
                    </div>
                    <p className="text-[13px] font-medium text-text-secondary">No notifications yet</p>
                    <p className="mt-1 text-[12px] text-text-muted">
                      Platform updates will appear here.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map(n => (
                      <li
                        key={n.notification_id || n.id}
                        className={`flex gap-3 border-b border-border-light px-5 py-4 transition hover:bg-bg-tertiary cursor-pointer ${
                          !n.is_read ? 'bg-brand/5' : 'bg-bg-card'
                        }`}
                        onClick={() => handleItemClick(n)}
                      >
                        {/* Icon */}
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            !n.is_read
                              ? 'bg-brand text-white'
                              : 'bg-bg-primary text-text-muted'
                          }`}
                        >
                          <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13px] leading-snug ${
                            !n.is_read
                              ? 'font-medium text-text-primary'
                              : 'text-text-secondary'
                          }`}>
                            {n.body || n.message || n.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-text-muted">
                              {n.created_at ? timeAgo(n.created_at) : ''}
                            </span>
                            {n.link && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand">
                                View <ExternalLink className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!n.is_read && (
                          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
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

export default AdminNotificationSidebar