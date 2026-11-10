import { useRef } from 'react'
import PostActions from './PostActions'
import CommentThread, { commentAuthor } from './CommentThread'
import ReplyBar from './ReplyBar'
import { CategoryTag, postAuthor } from './PostCard'

// Full-screen view of one post and its replies.
export default function PostDetail({
  post,
  onBack,
  actionProps,
  comments,
  replyTo,
  onReplyTo,
  commentText,
  onCommentTextChange,
  commentAnonymous,
  onCommentAnonymousChange,
  onAddComment,
  sendingReply,
  replyError,
  deleteProps,
}) {
  const inputRef = useRef(null)
  const replyingTo = replyTo && comments?.find(c => c.id === replyTo)

  function handleReplyTo(commentId) {
    onReplyTo(commentId)
    inputRef.current?.focus()
  }

  return (
    <div className="px-4 pt-2 pb-48">
      <button onClick={onBack} className="min-h-11 text-base font-medium text-brand">
        ‹ Feed
      </button>

      <article className="mt-2 pb-2 border-b border-line">
        <div className="flex items-center justify-between gap-3">
          <CategoryTag category={post.category} />
          <span className="text-sm text-muted">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="font-display font-bold text-2xl leading-snug tracking-[-0.01em] text-ink mt-3">
          {post.content}
        </p>
        <p className="text-sm text-muted mt-3">{postAuthor(post)}</p>
        <div className="mt-1">
          <PostActions post={post} {...actionProps} />
        </div>
      </article>

      <CommentThread
        postId={post.id}
        comments={comments}
        replyTo={replyTo}
        onReplyTo={handleReplyTo}
        deleteProps={deleteProps}
      />

      <ReplyBar
        text={commentText}
        onTextChange={onCommentTextChange}
        anonymous={commentAnonymous}
        onAnonymousChange={onCommentAnonymousChange}
        onSend={onAddComment}
        sending={sendingReply}
        error={replyError}
        replyingTo={replyingTo ? commentAuthor(replyingTo) : null}
        onCancelReply={() => onReplyTo(null)}
        inputRef={inputRef}
      />
    </div>
  )
}
