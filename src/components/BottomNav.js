const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const TABS = [
  {
    key: 'feed',
    label: 'Feed',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    key: 'safety',
    label: 'Safety',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      </svg>
    ),
  },
  {
    key: 'help',
    label: 'Help',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
      </svg>
    ),
  },
  {
    key: 'me',
    label: 'Me',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 w-full bg-surface border-t border-line flex">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          className={`flex-1 min-h-14 py-2 flex flex-col items-center justify-center gap-0.5 text-sm font-medium ${
            activeTab === tab.key ? 'text-brand' : 'text-muted'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
