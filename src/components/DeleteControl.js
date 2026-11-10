// Delete link with inline "Delete? Yes / No" confirm. Shared by PostCard and
// CommentThread; the confirm/error state lives in app/page.js.
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
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-gray-500">Delete?</span>
        <button onClick={() => onDelete(kind, id, postId)} className="text-xs font-medium text-red-600">Yes</button>
        <button onClick={onCancelDelete} className="text-xs text-gray-400">No</button>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={() => onRequestDelete(key)}
        className="text-xs text-gray-400 hover:text-red-500"
      >
        Delete
      </button>
      {deleteErrors[key] && <span className="text-xs text-red-500">Couldn&apos;t delete. Try again.</span>}
    </span>
  )
}
