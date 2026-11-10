// Text filter tabs with the 3px amber underline on the active one (design.md).
// tabs: [{ key, label }]
export default function TextTabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-5 border-b border-line overflow-x-auto ${className}`}>
      {tabs.map(t => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            aria-pressed={isActive}
            className={`min-h-11 -mb-px border-b-[3px] text-base flex-shrink-0 ${
              isActive
                ? 'border-accent text-ink font-semibold'
                : 'border-transparent text-muted'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
