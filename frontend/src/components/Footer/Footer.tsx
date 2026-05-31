/* global __PROJECT_NAME__, __PROJECT_OWNER__ */
import { Github, Linkedin, Twitter } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-[#c4c7c7] dark:border-[#3c4043] bg-[#f8f9fa] dark:bg-[#121418]">
      <div className="mx-auto flex max-w-[1200px] gap-16 px-6 py-10 sm:px-4">
        <div className="flex-1">
          <h3 className="mb-2 font-display text-[14px] font-bold text-[#191c1d] dark:text-[#e8eaed]">
            {__PROJECT_NAME__ || 'Vicharanashala'}
          </h3>
          <p className="max-w-xs text-[13px] leading-6 text-[#444748] dark:text-[#9aa0a6]">
            A collaborative platform for students to ask questions, share knowledge,
            and grow together through open contribution.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[12px] font-bold leading-none text-[#444748] dark:text-[#9aa0a6]">
            Project Lead
          </p>
          <p className="mb-4 text-[13px] text-[#444748] dark:text-[#9aa0a6]">
            {__PROJECT_OWNER__ || 'Samyabrata Roy'}
          </p>
          <div className="flex gap-3">
            {[
              { Icon: Github, label: 'GitHub' },
              { Icon: Linkedin, label: 'LinkedIn' },
              { Icon: Twitter, label: 'Twitter' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                title={label}
                className="text-[#444748] dark:text-[#9aa0a6] transition hover:text-black dark:hover:text-white"
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] border-t border-[#c4c7c7]/30 dark:border-[#3c4043]/30 px-4 py-6 text-center sm:px-4">
        <p className="text-[12px] leading-6 text-[#444748] dark:text-[#9aa0a6]">
          &copy; {new Date().getFullYear()} {__PROJECT_NAME__ || 'Vicharanashala'}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer