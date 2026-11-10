import DeleteControl from './DeleteControl'
import { categoryDisplay } from '@/lib/categories'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
]

function repliesLabel(count) {
  const n = Number(count) || 0
  if (n === 0) return 'No replies'
  return `${n} ${n === 1 ? 'reply' : 'replies'}`
}

// One feed post. The comment section is passed in as children and only
// rendered while the post is expanded.
export default function PostCard({
  post,
  onToggleUpvote,
  isExpanded,
  onToggleComments,
  replyCount,
  isReporting,
  onToggleReport,
  onCancelReport,
  reportStatus,
  onReport,
  deleteProps,
  children,
}) {
  const cat = categoryDisplay(post.category)
  const author = post.is_anonymous
    ? 'Anonymous · ' + (post.zip_code || 'Oakland')
    : post.author_name || 'Oakland Resident'

  return (
    <article className="bg-surface border border-line rounded-xl p-4">

      {/* category + date */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className={`w-2 h-2 rounded-full ${cat.dot}`} aria-hidden="true" />
          {cat.label}
        </span>
        <span className="text-sm text-muted">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* post text */}
      <p className="text-base text-ink mt-2">{post.content}</p>

      {/* author */}
      <p className="text-sm text-muted mt-2">{author}</p>

      {/* actions */}
      <div className="flex items-center gap-5 mt-1 flex-wrap">
        <button
          onClick={onToggleUpvote}
          aria-pressed={post.i_upvoted}
          aria-label={post.i_upvoted ? 'Remove upvote' : 'Upvote'}
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
        <button
          onClick={onToggleComments}
          aria-expanded={isExpanded}
          className="min-h-11 text-sm text-muted hover:text-ink"
        >
          {repliesLabel(replyCount)}
        </button>
        <button
          onClick={onToggleReport}
          disabled={reportStatus === 'done'}
          className="min-h-11 text-sm text-muted hover:text-danger disabled:hover:text-muted"
        >
          {reportStatus === 'done' ? 'Reported' : 'Report'}
        </button>
        {post.is_mine && <DeleteControl kind="post" id={post.id} variant="card" {...deleteProps} />}
      </div>

      {/* report reason picker */}
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

      {/* comments section */}
      {isExpanded && children}
    </article>
  )
}
