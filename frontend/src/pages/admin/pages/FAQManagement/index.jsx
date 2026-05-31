import { FileText, Settings } from 'lucide-react'

function FAQManagementView({ dashboardData }) {
  const questions = dashboardData?.recent?.questions || []
  const faqQuestions = questions.filter((question) => question.kind === 'faq')
  const faqTotal = dashboardData?.metrics?.questions?.faq || 0

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold text-text-primary">FAQ Management</h1>
          <p className="mt-2 text-[13px] text-text-secondary">Published FAQ content and queue health.</p>
        </div>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg bg-[#111827] px-4 text-[12px] font-semibold text-white transition hover:bg-[#2e3132]"
        >
          <Settings className="h-4 w-4" strokeWidth={1.8} />
          New FAQ
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">FAQ Entries</p>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">{faqTotal}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Recent FAQ</p>
          <p className="mt-2 text-[28px] font-semibold text-text-primary">{faqQuestions.length}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Status</p>
          <p className="mt-3 inline-flex rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase text-emerald-700">
            Synced
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-border-light bg-bg-card shadow-sm">
        <div className="border-b border-border-light px-5 py-4">
          <h2 className="flex items-center gap-2 text-[16px] font-bold text-text-primary">
            <FileText className="h-4 w-4 text-brand" strokeWidth={1.8} />
            Recent FAQ records
          </h2>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {faqQuestions.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-text-muted">
              No recent FAQ records in the admin feed.
            </p>
          ) : (
            faqQuestions.map((question) => (
              <div key={question.question_id} className="px-5 py-4">
                <p className="text-[13px] font-semibold text-text-primary">{question.title}</p>
                <p className="mt-1 text-[11px] capitalize text-text-muted">{question.status}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default FAQManagementView
