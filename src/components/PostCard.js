import DeleteControl from './DeleteControl'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
]

// One feed post. The comment section is passed in as children and only
// rendered while the post is expanded.
export default function PostCard({
  post,
  onToggleUpvote,
  isExpanded,
  onToggleComments,
  isReporting,
  onToggleReport,
  onCancelReport,
  reportStatus,
  onReport,
  deleteProps,
  children,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">

      {/* header row avatar, username, date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* first letter of username as avatar */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
            post.is_anonymous ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'
          }`}>
            {post.is_anonymous ? '?' : post.author_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-medium text-gray-700">
            {post.is_anonymous
              ? 'Anonymous · ' + (post.zip_code || 'Oakland')
              : post.author_name || 'Oakland Resident'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {post.is_mine && <DeleteControl kind="post" id={post.id} {...deleteProps} />}
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* post text */}
      <p className="text-gray-900 text-sm mb-2">{post.content}</p>

      {/* bottom row  badge and action buttons */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          post.category === 'safety' ? 'bg-red-100 text-red-700' :
          post.category === 'events' ? 'bg-blue-100 text-blue-700' :
          post.category === 'resources' ? 'bg-amber-100 text-amber-700' :
          'bg-green-100 text-green-700'
        }`}>
          {post.category}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleUpvote}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border ${
              post.i_upvoted
                ? 'text-green-700 border-green-200 bg-green-50'
                : 'text-gray-400 border-gray-200'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={post.i_upvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {post.upvote_count}
          </button>
          <button
            onClick={onToggleComments}
            className="text-xs text-gray-400"
          >
            Comment
          </button>
          <button
            onClick={onToggleReport}
            disabled={reportStatus === 'done'}
            className="text-xs text-gray-400 hover:text-red-400 disabled:hover:text-gray-400"
          >
            {reportStatus === 'done' ? '⚑ Reported' : '⚑ Report'}
          </button>
        </div>
      </div>

      {/* report reason picker */}
      {isReporting && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">Why are you reporting this post?</p>
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map(r => (
              <button
                key={r.value}
                onClick={() => onReport(r.value)}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={onCancelReport}
              className="text-xs px-3 py-1 text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {reportStatus === 'done' && (
        <p className="text-xs text-gray-400 mt-2">Post reported. Thank you for keeping Oakland Hub safe.</p>
      )}
      {reportStatus === 'error' && (
        <p className="text-xs text-red-500 mt-2">Couldn&apos;t send report. Please try again.</p>
      )}

      {/* comments section */}
      {isExpanded && children}
    </div>
  )
}
