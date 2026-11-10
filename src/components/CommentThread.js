import DeleteControl from './DeleteControl'

export function commentAuthor(comment) {
  return comment.is_anonymous ? 'Anonymous' : comment.author_name || 'Oakland Resident'
}

function CommentRow({ comment, postId, deleteProps, replyTo, onReplyTo }) {
  const canReply = !comment.parent_id
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{commentAuthor(comment)}</span>
        <span className="text-sm text-muted flex-shrink-0">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-base text-ink mt-1">{comment.content}</p>
      {(canReply || comment.is_mine) && (
        <div className="flex items-center gap-5">
          {canReply && (
            <button
              onClick={() => onReplyTo(comment.id)}
              aria-pressed={replyTo === comment.id}
              className={`min-h-11 text-sm ${
                replyTo === comment.id ? 'text-brand font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Reply
            </button>
          )}
          {comment.is_mine && (
            <DeleteControl kind="comment" id={comment.id} postId={postId} {...deleteProps} />
          )}
        </div>
      )}
    </div>
  )
}

// Replies under a post in Post detail: top-level comments as rows with 1px
// dividers, their replies indented with a 2px left line. The reply input is
// the ReplyBar at the bottom of the screen.
export default function CommentThread({ postId, comments, replyTo, onReplyTo, deleteProps }) {
  if (!comments) {
    return <p className="text-base text-muted py-4">Loading replies...</p>
  }
  const topLevel = comments.filter(c => !c.parent_id)
  if (topLevel.length === 0) {
    return <p className="text-base text-muted py-4">No replies yet.</p>
  }

  const rowProps = { postId, deleteProps, replyTo, onReplyTo }

  return (
    <ul className="divide-y divide-line">
      {topLevel.map(comment => {
        const replies = comments.filter(r => r.parent_id === comment.id)
        return (
          <li key={comment.id} className="py-3">
            <CommentRow comment={comment} {...rowProps} />
            {replies.length > 0 && (
              <ul className="ml-2 mt-1 pl-4 border-l-2 border-line flex flex-col gap-3">
                {replies.map(reply => (
                  <li key={reply.id}>
                    <CommentRow comment={reply} {...rowProps} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
