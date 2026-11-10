const CATEGORIES = ['general', 'safety', 'events', 'resources']

export default function ComposeBox({
  content,
  onContentChange,
  category,
  onCategoryChange,
  isAnonymous,
  onAnonymousChange,
  onPost,
  textareaRef,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => onContentChange(e.target.value)}
        placeholder="Share something with your neighborhood..."
        className="w-full text-sm text-gray-900 outline-none resize-none placeholder-gray-400"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-3 py-1 rounded-full border capitalize ${
              category === cat
                ? cat === 'safety' ? 'bg-red-500 text-white border-red-500' :
                  cat === 'events' ? 'bg-blue-500 text-white border-blue-500' :
                  cat === 'resources' ? 'bg-amber-500 text-white border-amber-500' :
                  'bg-green-800 text-white border-green-800'
                : 'text-gray-500 border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => onAnonymousChange(e.target.checked)}
            className="w-3 h-3 accent-green-800"
          />
          <span className="text-xs text-gray-500">Post anonymously</span>
        </label>
        <button onClick={onPost} className="bg-green-800 text-white text-xs px-4 py-2 rounded-full">
          Post
        </button>
      </div>
    </div>
  )
}
