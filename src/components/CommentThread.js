import DeleteControl from './DeleteControl'

function AnonymousToggle({ checked, onChange }) {
  return (
    <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-3 h-3 accent-green-800"
      />
      <span className="text-xs text-gray-500">Anonymous</span>
    </label>
  )
}

// Comments and one level of replies under a post, plus the comment/reply input.
// commentText, commentAnonymous and replyTo are shared across all posts and
// live in app/page.js.
export default function CommentThread({
  postId,
  comments,
  replyTo,
  onToggleReply,
  commentText,
  onCommentTextChange,
  commentAnonymous,
  onCommentAnonymousChange,
  onAddComment,
  deleteProps,
}) {
  const anonymousToggle = (
    <AnonymousToggle checked={commentAnonymous} onChange={onCommentAnonymousChange} />
  )

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">

      {/* existing comments */}
      {comments?.filter(c => !c.parent_id).map(comment => (
        <div key={comment.id} className="mb-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-800 flex-shrink-0">
              {comment.is_anonymous ? '?' : comment.author_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs font-medium text-gray-700">
                {comment.is_anonymous ? 'Anonymous' : comment.author_name || 'Oakland Resident'}
              </span>
              <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
            </div>
          </div>

          {/* replies */}
          {comments?.filter(r => r.parent_id === comment.id).map(reply => (
            <div key={reply.id} className="ml-8 mt-2 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                {reply.is_anonymous ? '?' : reply.author_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs font-medium text-gray-700">
                  {reply.is_anonymous ? 'Anonymous' : reply.author_name || 'Oakland Resident'}
                </span>
                <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                {reply.is_mine && (
                  <div className="mt-1">
                    <DeleteControl kind="comment" id={reply.id} postId={postId} {...deleteProps} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* reply button */}
          <div className="ml-8 mt-1 flex items-center gap-3">
            <button
              onClick={() => onToggleReply(comment.id)}
              className="text-xs text-gray-400 hover:text-green-700"
            >
              ↩ Reply
            </button>
            {comment.is_mine && (
              <DeleteControl kind="comment" id={comment.id} postId={postId} {...deleteProps} />
            )}
          </div>

          {/* reply input */}
          {replyTo === comment.id && (
            <div className="ml-8 mt-2 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => onCommentTextChange(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 min-w-0 text-xs border border-gray-200 rounded-full px-3 py-2 outline-none text-gray-900 placeholder-gray-400"
              />
              {anonymousToggle}
              <button
                onClick={() => onAddComment(comment.id)}
                className="bg-green-800 text-white text-xs px-3 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          )}
        </div>
      ))}

      {/* new comment input */}
      {!replyTo && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={commentText}
            onChange={e => onCommentTextChange(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 min-w-0 text-xs border border-gray-200 rounded-full px-3 py-2 outline-none text-gray-900 placeholder-gray-400"
          />
          {anonymousToggle}
          <button
            onClick={() => onAddComment(null)}
            className="bg-green-800 text-white text-xs px-3 py-2 rounded-full"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
