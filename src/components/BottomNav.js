const TABS = [
  { key: 'feed', label: 'Feed' },
  { key: 'safety', label: 'Safety' },
  { key: 'me', label: 'Me' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-3 text-xs font-medium ${
            activeTab === tab.key ? 'text-green-800' : 'text-gray-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
