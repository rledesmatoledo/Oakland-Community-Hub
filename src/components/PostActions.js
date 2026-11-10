import DeleteControl from './DeleteControl'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
]

// Upvote / Report / Delete row plus the report reason picker. Used by PostCard
// (feed) and PostDetail. `children` go right after the upvote button.
export default function PostActions({
  post,
  onToggleUpvote,
  isReporting,
  onToggleReport,
  onCancelReport,
  reportStatus,
  onReport,
  deleteProps,
  children,
}) {
  return (
    <>
      <div className="flex items-center gap-5 flex-wrap">
        <button
          onClick={onToggleUpvote}
          aria-pressed={post.i_upvoted}
          aria-label={`${post.i_upvoted ? 'Remove upvote' : 'Upvote'} (${post.upvote_count})`}
          className={`min-h-11 flex items-center gap-1.5 text-sm font-medium ${
            post.i_upvoted ? 'text-accent-ink' : 'text-muted'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.i_upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          {post.upvote_count}
        </button>
        {children}
        <button
          onClick={onToggleReport}
          disabled={reportStatus === 'done'}
          className="min-h-11 text-sm text-muted hover:text-danger disabled:hover:text-muted"
        >
          {reportStatus === 'done' ? 'Reported' : 'Report'}
        </button>
        {post.is_mine && <DeleteControl kind="post" id={post.id} {...deleteProps} />}
      </div>

      {isReporting && (
        <div className="mt-2 border-t border-line-soft pt-3">
          <p className="text-sm text-muted">Why are you reporting this post?</p>
          <div className="flex flex-wrap gap-x-5">
            {REPORT_REASONS.map(r => (
              <button
                key={r.value}
                onClick={() => onReport(r.value)}
                className="min-h-11 text-sm text-ink hover:text-danger"
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={onCancelReport}
              className="min-h-11 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {reportStatus === 'done' && (
        <p className="text-sm text-muted mt-1">Post reported. Thank you for keeping Oakland Hub safe.</p>
      )}
      {reportStatus === 'error' && (
        <p className="text-sm text-danger mt-1">Couldn&apos;t send report. Please try again.</p>
      )}
    </>
  )
}
