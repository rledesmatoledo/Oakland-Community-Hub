import Switch from './Switch'

const ALERTS = [
  { id: 'alert-safety', label: 'Safety alerts near me' },
  { id: 'alert-replies', label: 'Replies to my posts' },
]

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="font-display font-bold text-xl text-ink tracking-[-0.01em] mb-1">{title}</h2>
      {children}
    </section>
  )
}

export default function MeTab({ profile, loading, onLogout }) {
  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl text-ink tracking-[-0.02em]">
        {/* blank (but same height) until the profile loads */}
        {loading ? ' ' : profile?.username || 'Oakland Resident'}
      </h1>
      <p className="flex items-center gap-1.5 text-sm text-muted mt-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        Verified · {loading ? '' : profile?.zip_code || 'Oakland'}
      </p>

      <Section title="Alerts">
        <ul className="divide-y divide-line">
          {ALERTS.map(a => (
            <li key={a.id} className="py-2 flex items-center justify-between gap-4">
              <div>
                <p id={a.id} className="text-base text-ink">{a.label}</p>
                <p className="text-sm text-muted">Coming soon</p>
              </div>
              <Switch checked={false} labelledBy={a.id} disabled />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Privacy">
        <ul className="divide-y divide-line">
          <li className="py-3">
            <p className="text-base text-ink">Anonymous by default</p>
            <p className="text-sm text-muted mt-0.5">
              Your posts and comments don&apos;t show your username unless you choose to share it.
            </p>
          </li>
          <li className="py-3 flex items-center justify-between gap-4">
            <p className="text-base text-ink">Language</p>
            <p className="text-base text-muted">English</p>
          </li>
        </ul>
      </Section>

      <button
        onClick={onLogout}
        className="mt-8 min-h-11 px-5 rounded-full border border-field-border text-base font-medium text-ink"
      >
        Sign out
      </button>

      <p className="text-sm text-muted text-center mt-10 pb-4">
        Made in Oakland · Not affiliated with the City of Oakland
      </p>
    </div>
  )
}
