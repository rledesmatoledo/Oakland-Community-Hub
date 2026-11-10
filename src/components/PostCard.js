import PostActions from './PostActions'
import { categoryDisplay } from '@/lib/categories'

export function postAuthor(post) {
  return post.is_anonymous
    ? 'Anonymous · ' + (post.zip_code || 'Oakland')
    : post.author_name || 'Oakland Resident'
}

export function repliesLabel(count) {
  const n = Number(count) || 0
  if (n === 0) return 'No replies'
  return `${n} ${n === 1 ? 'reply' : 'replies'}`
}

export function CategoryTag({ category }) {
  const cat = categoryDisplay(category)
  return (
    <span className="flex items-center gap-2 text-sm font-medium text-ink">
      <span className={`w-2 h-2 rounded-full ${cat.dot}`} aria-hidden="true" />
      {cat.label}
    </span>
  )
}

// One post in the feed. Tapping the text or the replies label opens Post detail.
export default function PostCard({ post, replyCount, onOpen, actionProps }) {
  return (
    <article className="bg-surface border border-line rounded-xl p-4">

      {/* category + date */}
      <div className="flex items-center justify-between gap-3">
        <CategoryTag category={post.category} />
        <span className="text-sm text-muted">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* post text: opens detail */}
      <button onClick={onOpen} className="block w-full text-left text-base text-ink mt-2">
        {post.content}
      </button>

      {/* author */}
      <p className="text-sm text-muted mt-2">{postAuthor(post)}</p>

      <div className="mt-1">
        <PostActions post={post} {...actionProps}>
          <button onClick={onOpen} className="min-h-11 text-sm text-muted hover:text-ink">
            {repliesLabel(replyCount)}
          </button>
        </PostActions>
      </div>
    </article>
  )
}
