// How stored post categories are shown in the UI (see docs/design.md).
// The database values stay the same; only labels and dot colors change.
export const CATEGORY_DISPLAY = {
  general: { label: 'Neighbors', dot: 'bg-cat-neighbors' },
  safety: { label: 'Safety', dot: 'bg-cat-safety' },
  events: { label: 'Happening', dot: 'bg-cat-happening' },
  resources: { label: 'Help', dot: 'bg-cat-help' },
}

export function categoryDisplay(category) {
  return CATEGORY_DISPLAY[category] || CATEGORY_DISPLAY.general
}

// Feed filter tabs. `category: null` means show everything.
export const FEED_FILTERS = [
  { key: 'all', label: 'Everything', category: null },
  { key: 'safety', label: 'Safety', category: 'safety' },
  { key: 'happening', label: 'Happening', category: 'events' },
  { key: 'neighbors', label: 'Neighbors', category: 'general' },
]

// Categories offered in Compose (stored values). "resources" is no longer offered.
export const COMPOSE_CATEGORIES = ['safety', 'events', 'general']
