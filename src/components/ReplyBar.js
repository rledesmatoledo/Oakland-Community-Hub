// Fixed reply bar at the bottom of Post detail.
export default function ReplyBar({
  text,
  onTextChange,
  anonymous,
  onAnonymousChange,
  onSend,
  sending,
  error,
  replyingTo,
  onCancelReply,
  inputRef,
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSend()
      }}
      className="fixed bottom-0 inset-x-0 bg-surface border-t border-line px-4 pt-2 pb-2"
    >
      {replyingTo && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted">Replying to {replyingTo}</span>
          <button type="button" onClick={onCancelReply} className="min-h-11 text-sm text-brand">
            Cancel
          </button>
        </div>
      )}
      {error && (
        <p className="text-sm text-danger pt-1 pb-2">Couldn&apos;t send. Please try again.</p>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => onTextChange(e.target.value)}
          placeholder={replyingTo ? 'Write a reply...' : 'Reply to this post...'}
          aria-label="Reply"
          className="flex-1 min-w-0 min-h-11 border border-field-border rounded-xl px-3 text-base text-ink placeholder:text-muted outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="min-h-11 px-5 rounded-full bg-accent text-ink font-semibold flex-shrink-0 disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <label className="flex flex-wrap items-center gap-x-2 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={e => onAnonymousChange(e.target.checked)}
          className="w-4 h-4 accent-brand"
        />
        <span className="text-sm text-ink">Reply anonymously</span>
        <span className="text-sm text-muted">
          {anonymous ? 'neighbors see your zip, not your name' : 'neighbors see your username'}
        </span>
      </label>
    </form>
  )
}
