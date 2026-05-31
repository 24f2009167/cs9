/* global __PROJECT_NAME__, __PROJECT_OWNER__ */
import { Code2, Briefcase, Bird } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-border bg-bg-tertiary">
      <div className="mx-auto flex max-w-[1200px] gap-16 px-6 py-10 sm:px-4">
        <div className="flex-1">
          <h3 className="mb-2 font-display text-[14px] font-bold text-text-primary">
            {__PROJECT_NAME__ || 'Vicharanashala'}
          </h3>
          <p className="max-w-xs text-[13px] leading-6 text-text-secondary">
            A collaborative platform for students to ask questions, share knowledge,
            and grow together through open contribution.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[12px] font-bold leading-none text-text-secondary">
            Project Lead
          </p>
          <p className="mb-4 text-[13px] text-text-secondary">
            {__PROJECT_OWNER__ || 'Samyabrata Roy'}
          </p>
          <div className="flex gap-3">
            {[
              { Icon: Code2, label: 'GitHub' },
              { Icon: Briefcase, label: 'LinkedIn' },
              { Icon: Bird, label: 'Twitter' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                title={label}
                className="text-text-secondary transition hover:text-text-primary"
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] border-t border-border/30 px-4 py-6 text-center sm:px-4">
        <p className="text-[12px] leading-6 text-text-secondary">
          &copy; {new Date().getFullYear()} {__PROJECT_NAME__ || 'Vicharanashala'}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer