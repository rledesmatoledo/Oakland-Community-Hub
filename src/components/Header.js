import OakLogo from './OakLogo'

export default function Header({ zipCode, loading, onCompose }) {
  return (
    <header className="bg-canvas border-b border-line px-4 pt-4 pb-4">
      <div className="flex items-center gap-2">
        <OakLogo />
        <span className="font-display font-bold text-lg text-ink tracking-[-0.01em]">Oakland Hub</span>
      </div>

      <div className="flex items-end justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-ink tracking-[-0.02em] leading-tight">
            {/* blank (but same height) until the profile loads */}
            {loading ? '\u00a0' : zipCode || 'Oakland'}
          </h1>
          <p className="text-sm text-muted">verified neighbor</p>
        </div>
        <button
          onClick={onCompose}
          className="min-h-11 px-5 rounded-full bg-accent text-ink font-semibold text-base flex-shrink-0"
        >
          + Post
        </button>
      </div>
    </header>
  )
}
