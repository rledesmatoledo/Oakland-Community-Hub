import Switch from './Switch'
import { COMPOSE_CATEGORIES, categoryDisplay } from '@/lib/categories'

// Full-screen compose view, opened from "+ Post" in the header.
export default function ComposeView({
  content,
  onContentChange,
  category,
  onCategoryChange,
  isAnonymous,
  onAnonymousChange,
  onPost,
  onCancel,
  posting,
  postError,
}) {
  return (
    <div className="px-4 pt-2 pb-8">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="min-h-11 text-base font-medium text-brand">
          Cancel
        </button>
        <h1 className="font-display font-bold text-lg text-ink tracking-[-0.01em]">New post</h1>
        {/* keeps the title centered */}
        <span className="w-14" aria-hidden="true" />
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm text-muted">Category</legend>
        <div className="flex flex-wrap gap-x-6 mt-1">
          {COMPOSE_CATEGORIES.map(value => {
            const cat = categoryDisplay(value)
            return (
              <label key={value} className="flex items-center gap-2 min-h-11 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={category === value}
                  onChange={() => onCategoryChange(value)}
                  className="w-4 h-4 accent-brand"
                />
                <span className={`w-2 h-2 rounded-full ${cat.dot}`} aria-hidden="true" />
                <span className={`text-base ${category === value ? 'text-ink font-semibold' : 'text-ink'}`}>
                  {cat.label}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <textarea
        value={content}
        onChange={e => onContentChange(e.target.value)}
        placeholder="Share something with your neighborhood..."
        aria-label="Post text"
        rows={6}
        autoFocus
        className="mt-3 w-full bg-surface border border-field-border rounded-xl p-3 text-base text-ink placeholder:text-muted outline-none focus:border-brand resize-none"
      />

      <p className="mt-4 border-l-[3px] border-brand pl-3 text-base text-ink">
        Say what happened, not what someone looks like.
      </p>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p id="anon-label" className="text-base font-medium text-ink">Post anonymously</p>
          <p className="text-sm text-muted">
            {isAnonymous ? 'Neighbors see your zip, not your name.' : 'Neighbors see your username.'}
          </p>
        </div>
        <Switch checked={isAnonymous} onChange={onAnonymousChange} labelledBy="anon-label" />
      </div>

      {postError && (
        <p className="mt-4 text-sm text-danger">Couldn&apos;t post. Please try again.</p>
      )}

      <button
        onClick={onPost}
        disabled={!content.trim() || posting}
        className="mt-6 w-full min-h-12 rounded-full bg-accent text-ink text-base font-semibold disabled:opacity-50"
      >
        {posting ? 'Posting...' : 'Post'}
      </button>
    </div>
  )
}
