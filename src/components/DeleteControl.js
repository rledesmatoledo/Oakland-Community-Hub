// Delete link with inline "Delete? Yes / No" confirm. Shared by PostCard and
// CommentThread; the confirm/error state lives in app/page.js.
// variant="card" is the design.md style (PostCard); the default keeps the
// older small style still used in comments.
const STYLES = {
  default: {
    wrap: 'inline-flex items-center gap-2',
    prompt: 'text-xs text-gray-500',
    yes: 'text-xs font-medium text-red-600',
    no: 'text-xs text-gray-400',
    del: 'text-xs text-gray-400 hover:text-red-500',
    error: 'text-xs text-red-500',
  },
  card: {
    wrap: 'inline-flex items-center gap-3',
    prompt: 'text-sm text-muted',
    yes: 'min-h-11 text-sm font-semibold text-danger',
    no: 'min-h-11 text-sm text-muted',
    del: 'min-h-11 text-sm text-muted hover:text-danger',
    error: 'text-sm text-danger',
  },
}

export default function DeleteControl({
  kind,
  id,
  postId,
  confirmDelete,
  deleteErrors,
  onRequestDelete,
  onCancelDelete,
  onDelete,
  variant = 'default',
}) {
  const s = STYLES[variant]
  const key = `${kind}-${id}`
  if (confirmDelete === key) {
    return (
      <span className={s.wrap}>
        <span className={s.prompt}>Delete?</span>
        <button onClick={() => onDelete(kind, id, postId)} className={s.yes}>Yes</button>
        <button onClick={onCancelDelete} className={s.no}>No</button>
      </span>
    )
  }
  return (
    <span className={s.wrap}>
      <button
        onClick={() => onRequestDelete(key)}
        className={s.del}
      >
        Delete
      </button>
      {deleteErrors[key] && <span className={s.error}>Couldn&apos;t delete. Try again.</span>}
    </span>
  )
}
