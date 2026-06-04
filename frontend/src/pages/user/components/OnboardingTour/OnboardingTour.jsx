import { useEffect, useState } from 'react'

const tourSteps = [
  {
    title: 'Welcome to Vicharanashala FAQ! 🎓',
    subtitle: 'Student Portal Overview',
    body: "Welcome to your query resolution center! Let's take a quick 2-minute tour to help you navigate your dashboard, search categories, upvote questions, submit new queries, track contributions, and earn Spark points.",
    icon: (
      <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    selector: '[data-tour="search-bar"]',
    title: 'Search FAQs & Categories 🔍',
    subtitle: 'Instant Knowledge Base Lookup',
    body: 'Use the search bar and categories filter to quickly look up existing questions. Try searching before asking a new question to find immediate answers!',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="tabs-filter"]',
    title: 'Filter by Status & Trends 📊',
    subtitle: 'Tabbed Query Discovery',
    body: 'Switch between tabs like Trending, Unanswered, and Resolved to explore community queries in different stages of resolution.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="upvote-btn"]',
    title: 'Upvote to Prioritize 👍',
    subtitle: 'Collaborative Query Ranking',
    body: 'If you have the same question as another student, upvote their query. High-upvote queries get resolved faster by our laboratory mentors!',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163-.024-.298-.09-.4-.2l-3.7-3.7a1 1 0 01-.3-.7V10a1 1 0 01.3-.7l4-4a1 1 0 011.4 0l.7.7a1 1 0 01.3.7v3.3H14z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="raise-query-btn"]',
    title: 'Raise a New Query ✍️',
    subtitle: 'Submit a Q&A Thread',
    body: "Can't find what you need? Ask a new question here and set a Spark bounty to reward anyone who answers it.",
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="contributions-widget"]',
    title: 'Contributions & Sparks ⚡',
    subtitle: 'Spark Points Economy',
    body: 'Track your questions, answers, and comments here. Your active Spark points will also show up in this panel.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="user-sidebar"]',
    title: 'Left Menu Navigation 🗂️',
    subtitle: 'Portal Sidebar Controls',
    body: 'Switch seamlessly between your main Q&A Dashboard, global FAQ list, your own raised Queries, and the Leaderboard.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  },
  {
    selector: '[data-tour="user-notifications"]',
    title: 'Real-time Alerts & Feeds 🔔',
    subtitle: 'Instant Activity Stream',
    body: 'Get notified immediately when a mentor answers your question, someone comments on your post, or when your query is resolved.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
  {
    selector: '[data-tour="user-theme"]',
    title: 'Dark / Light Mode 🌗',
    subtitle: 'Interface Personalization',
    body: 'Toggle between dark and light themes at any time to match your environmental lighting and focus preferences.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  },
  {
    selector: '[data-tour="user-menu"]',
    title: 'Profile & Onboarding Tour ⚙️',
    subtitle: 'User Account Controls',
    body: 'Click your profile dropdown to edit your settings, restart this Product Tour whenever you need a refresh, or safely logout.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
]

const styleContent = `
  @keyframes tourFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes spotlightPulse {
    0%, 100% {
      border-color: rgba(140, 106, 64, 0.5);
      box-shadow: 0 0 0 9999px rgba(10, 11, 14, 0.75), 0 0 15px rgba(140, 106, 64, 0.4);
    }
    50% {
      border-color: rgba(140, 106, 64, 0.95);
      box-shadow: 0 0 0 9999px rgba(10, 11, 14, 0.75), 0 0 25px rgba(140, 106, 64, 0.8);
    }
  }

  @keyframes floatIcon {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-6px) rotate(3deg); }
  }

  .tour-pulse-glow {
    animation: spotlightPulse 2s infinite ease-in-out;
  }

  .tour-animate-card {
    animation: tourFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .tour-float-icon {
    animation: floatIcon 3s infinite ease-in-out;
  }
`

function OnboardingTour({ userId, isActive, onClose }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  })

  // Reset to first step when tour becomes active
  useEffect(() => {
    if (isActive) {
      setStep(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const currentStep = tourSteps[step]
    if (!currentStep.selector) {
      setRect(null)
      setTooltipStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      })
      return
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.selector)
      if (element) {
        // Scroll target to the center instantly for robust positioning and cutout coordinates
        element.scrollIntoView({ block: 'center', behavior: 'auto' })

        const r = element.getBoundingClientRect()
        setRect(r)

        const spaceBelow = window.innerHeight - r.bottom
        const spaceAbove = r.top
        let tooltipTop
        let tooltipLeft = r.left + r.width / 2 - 175 // Center 350px tooltip horizontally

        // Clamp left position to viewport boundaries
        tooltipLeft = Math.max(16, Math.min(window.innerWidth - 366, tooltipLeft))

        let tooltipTransform
        if (spaceBelow > 260 || spaceBelow > spaceAbove) {
          // Position below target
          tooltipTop = r.bottom + 12
          tooltipTransform = 'none'
        } else {
          // Position above target
          tooltipTop = r.top - 12
          tooltipTransform = 'translateY(-100%)'
        }

        setTooltipStyle({
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          transform: tooltipTransform,
        })
      } else {
        // Fallback to center if element is not in DOM
        setRect(null)
        setTooltipStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        })
      }
    }

    // Delay slightly to ensure DOM is ready and tabs are rendered
    const timer = setTimeout(updatePosition, 100)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [step, isActive])

  if (!isActive) return null

  const currentStep = tourSteps[step]
  const isFirst = step === 0
  const isLast = step === tourSteps.length - 1
  const progressPercent = ((step + 1) / tourSteps.length) * 100

  const handleNext = () => {
    if (isLast) {
      handleFinish()
    } else {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) {
      setStep(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    localStorage.setItem(`rogare-tour-completed-${userId}`, 'true')
    onClose?.()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />

      {/* Background Overlay */}
      <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300" />

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="tour-pulse-glow"
          style={{
            position: 'fixed',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: '12px',
            border: '2.5px solid var(--color-brand)',
            zIndex: 9998,
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Tooltip Card wrapper to handle outer coordinates/translations */}
      <div
        style={{
          position: 'fixed',
          top: tooltipStyle.top,
          left: tooltipStyle.left,
          transform: tooltipStyle.transform,
          zIndex: 10000,
          width: '350px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Inner card with CSS animation (no transform collisions) */}
        <div className="tour-animate-card rounded-2xl border border-border-light bg-bg-card/95 p-6 shadow-2xl backdrop-blur-lg dark:border-border/40 dark:bg-bg-card/90">
          {/* Top Progress Line */}
          <div className="absolute left-0 top-0 h-1.5 w-full overflow-hidden rounded-t-2xl bg-bg-tertiary">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-hover transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Header */}
          <div className="mt-1 flex items-start gap-4">
            {/* Animated Icon Container */}
            <div className="tour-float-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              {currentStep.icon}
            </div>

            <div className="flex-1">
              <h4 className="font-sans text-[16px] font-extrabold leading-tight text-text-primary">
                {currentStep.title}
              </h4>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-border-light dark:bg-border/30" />

          {/* Body Text */}
          <p className="text-[13px] leading-5 text-text-secondary">
            {currentStep.body}
          </p>

          {/* Progress Bar & Buttons */}
          <div className="mt-6 flex items-center justify-between">
            {/* Skip Link */}
            <button
              type="button"
              onClick={handleFinish}
              className="text-[12px] font-bold text-text-muted hover:text-brand transition duration-200"
            >
              Skip Tour
            </button>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Step Count */}
              <span className="rounded-md bg-bg-tertiary px-2 py-1 text-[11px] font-bold text-text-secondary">
                {step + 1} / {tourSteps.length}
              </span>

              {/* Back Button */}
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-lg border border-border-light bg-bg-secondary px-3 py-1.5 text-[12px] font-bold text-text-secondary hover:bg-bg-tertiary transition duration-200 dark:border-border/40"
                >
                  Back
                </button>
              )}

              {/* Next/Finish Button */}
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-gradient-to-r from-brand to-brand-hover px-4 py-1.5 text-[12px] font-extrabold text-white shadow-sm hover:brightness-110 active:scale-95 transition duration-200"
              >
                {isLast ? 'Finish 🏁' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OnboardingTour
