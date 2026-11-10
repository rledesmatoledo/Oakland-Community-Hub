// Delete link with inline "Delete? Yes / No" confirm. Shared by posts and
// comments; the confirm/error state lives in app/page.js.
export default function DeleteControl({
  kind,
  id,
  postId,
  confirmDelete,
  deleteErrors,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}) {
  const key = `${kind}-${id}`
  if (confirmDelete === key) {
    return (
      <span className="inline-flex items-center gap-3">
        <span className="text-sm text-muted">Delete?</span>
        <button onClick={() => onDelete(kind, id, postId)} className="min-h-11 text-sm font-semibold text-danger">Yes</button>
        <button onClick={onCancelDelete} className="min-h-11 text-sm text-muted">No</button>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-3">
      <button
        onClick={() => onRequestDelete(key)}
        className="min-h-11 text-sm text-muted hover:text-danger"
      >
        Delete
      </button>
      {deleteErrors[key] && <span className="text-sm text-danger">Couldn&apos;t delete. Try again.</span>}
    </span>
  )
}
