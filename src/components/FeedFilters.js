import { FEED_FILTERS } from '@/lib/categories'

export default function FeedFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="flex gap-5 border-b border-line mb-4 overflow-x-auto">
      {FEED_FILTERS.map(f => {
        const active = activeFilter === f.key
        return (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`min-h-11 -mb-px border-b-[3px] text-base flex-shrink-0 ${
              active
                ? 'border-accent text-ink font-semibold'
                : 'border-transparent text-muted'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
