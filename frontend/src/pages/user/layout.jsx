import { useEffect, useState, useLayoutEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import DashboardHeader from './components/Header/DashboardHeader'
import LeftPane from './components/LeftPane/LeftPane'
import Footer from '../../components/Footer/Footer'
import NotificationSidebar from './components/NotifSidebar/NotificationSidebar'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import { queryClient } from '../../lib/queryClient'
import { fetchNotifications, markAllNotifRead, logoutUser, fetchQuestionTags } from './service'

function UserLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearUser } = useAuthStore()
  const isDark = useThemeStore(s => s.isDark)
  const toggleDark = useThemeStore(s => s.toggleDark)

  // Sync .dark class to <body> so CSS variables + dark: variants propagate globally
  useLayoutEffect(() => {
    document.body.classList[isDark ? 'add' : 'remove']('dark')
  }, [isDark])

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false)
  const [currentView, setCurrentView]     = useState('dashboard')
  const [sidebarNav, setSidebarNav]        = useState('Dashboard')
  const [notifSidebarOpen, setNotifSidebarOpen] = useState(false)
  const [selectedTags, setSelectedTags]    = useState([])
  const [searchQuery, setSearchQuery]      = useState('')
  const [tags, setTags]                   = useState([])

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  useEffect(() => {
    fetchNotifications()
      .then(data => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount ?? 0)
      })
      .catch(() => {})

    fetchQuestionTags()
      .then(data => {
        setTags(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try {
      await logoutUser()
    } catch {
      // Clear locally even if API call fails
    }
    clearUser()
    navigate('/')
  }

  async function handleNotifOpen() {
    if (unreadCount > 0) {
      try {
        await markAllNotifRead()
        setUnreadCount(0)
        setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
      } catch { /* silent */ }
    }
  }

  function handleNotifViewAll() {
    setNotifSidebarOpen(true)
  }

  async function handleMarkAllNotifRead() {
    try {
      await markAllNotifRead()
      setUnreadCount(0)
      setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
    } catch { /* silent */ }
  }

  return (
    <div
      className={`flex min-h-svh flex-col bg-bg-primary text-text-primary ${
        isDark ? 'dark' : ''
      }`}
    >
      {/* Main row: LeftPane + content */}
      <div className="flex flex-1">
        <LeftPane
          isCollapsed={isLeftPaneCollapsed}
          onToggleCollapse={() => setIsLeftPaneCollapsed(v => !v)}
          sidebarNav={location.pathname === '/leaderboard' ? 'Leaderboard' : sidebarNav}
          currentView={currentView}
          onNavigate={label => {
            if (label === 'Leaderboard') {
              navigate('/leaderboard')
              return
            }
            setSidebarNav(label)
            setCurrentView('dashboard')
            queryClient.removeQueries({ queryKey: ['dashboardQuestions'] })
            navigate('/dashboard')
          }}
        />

        <div className="flex flex-1 flex-col">
          <DashboardHeader
            user={user}
            initials={initials}
            notifications={notifications}
            unreadCount={unreadCount}
            isDark={isDark}
            onDarkToggle={toggleDark}
            searchQuery={searchQuery}
            onSearchOpen={setSearchQuery}
            tags={tags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            onNotifOpen={handleNotifOpen}
            onNotifViewAll={handleNotifViewAll}
            showRaiseQuery={location.pathname !== '/raise-query'}
            onRaiseQuery={() => navigate('/raise-query')}
            onProfileSettings={() => navigate('/profile')}
            onLogout={handleLogout}
          />

          <Outlet
            context={{
              user,
              sidebarNav,
              setSidebarNav,
              currentView,
              setCurrentView,
              initials,
              searchQuery,
              selectedTags,
              setSelectedTags,
              tags,
            }}
          />
        </div>
      </div>

      {/* Footer — full width, outside content area */}
      <Footer />

      {/* Notification sidebar */}
      <NotificationSidebar
        isOpen={notifSidebarOpen}
        onClose={() => setNotifSidebarOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotifRead}
      />
    </div>
  )
}

export default UserLayout