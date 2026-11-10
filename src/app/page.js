'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import FeedFilters from '@/components/FeedFilters'
import HelpTab from '@/components/HelpTab'
import ComposeBox from '@/components/ComposeBox'
import PostCard from '@/components/PostCard'
import CommentThread from '@/components/CommentThread'
import SafetyTab from '@/components/SafetyTab'
import MeTab from '@/components/MeTab'
import { FEED_FILTERS } from '@/lib/categories'

function feedPostsQuery(supabase) {
  return supabase
    .from('feed_posts')
    .select('*')
    .order('created_at', { ascending: false })
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [comments, setComments] = useState({})
  const [commentAnonymous, setCommentAnonymous] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [reportingPost, setReportingPost] = useState(null)
  const [reportedPosts, setReportedPosts] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)   // e.g. 'post-12' or 'comment-34'
  const [deleteErrors, setDeleteErrors] = useState({})
  const [feedFilter, setFeedFilter] = useState('all')
  const composeRef = useRef(null)
  const [composeRequest, setComposeRequest] = useState(0)

  async function getPosts() {
    const { data, error } = await feedPostsQuery(supabase)
    if (error) console.log(error)
    setPosts(data || [])
  }

  useEffect(() => {
    // Set to true on unmount so late responses are dropped
    let ignore = false

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (ignore) return
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Only load the feed once we know someone is signed in
      feedPostsQuery(supabase).then(({ data, error }) => {
        if (ignore) return
        if (error) console.log(error)
        setPosts(data || [])
      })

      supabase
        .from('profiles')
        .select('username, zip_code')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (ignore) return
          if (error) console.log(error)
          setProfile(data)
          setProfileLoaded(true)
        })
    })

    return () => { ignore = true }
  }, [supabase, router])

  // "+ Post" in the header: switch to the feed (if needed), then focus the compose box
  useEffect(() => {
    if (composeRequest === 0) return
    const box = composeRef.current
    if (!box) return
    box.focus({ preventScroll: true })
    box.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [composeRequest])

  function openCompose() {
    setActiveTab('feed')
    setComposeRequest(n => n + 1)
  }

  async function getComments(postId) {
    const { data, error } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (error) console.log(error)
    setComments(prev => ({ ...prev, [postId]: data || [] }))
  }

  async function createPost() {
    if (!content.trim()) return
    const { error } = await supabase.from('posts').insert({
      user_id: user?.id,
      content,
      category,
      is_anonymous: isAnonymous,
    })
    if (error) console.log(error)
    setContent('')
    setIsAnonymous(true)
    getPosts()
  }

  async function toggleUpvote(post) {
    if (post.i_upvoted) {
      await supabase.from('upvotes')
        .delete().eq('post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('upvotes')
        .insert({ post_id: post.id, user_id: user.id })
    }
    getPosts()
  }

  async function addComment(postId, parentId = null) {
    if (!commentText.trim()) return
    const { error } = await supabase.from('comments').insert({
      user_id: user?.id,
      post_id: postId,
      content: commentText,
      is_anonymous: commentAnonymous,
      parent_id: parentId,
    })
    if (error) console.log(error)
    setCommentText('')
    setCommentAnonymous(true)
    setReplyTo(null)
    getComments(postId)
  }

  async function reportPost(postId, reason) {
    const { error } = await supabase.from('reports').insert({
      post_id: postId,
      user_id: user?.id,
      reason,
    })
    setReportingPost(null)
    if (error) {
      console.log(error)
      setReportedPosts(prev => ({ ...prev, [postId]: 'error' }))
    } else {
      setReportedPosts(prev => ({ ...prev, [postId]: 'done' }))
    }
  }

  async function deleteItem(kind, id, postId) {
    const key = `${kind}-${id}`
    // RLS turns someone else's delete into "0 rows", not an error, so check the count
    const { error, count } = await supabase
      .from(kind === 'post' ? 'posts' : 'comments')
      .delete({ count: 'exact' })
      .eq('id', id)
    setConfirmDelete(null)
    if (error || count === 0) {
      if (error) console.log(error)
      setDeleteErrors(prev => ({ ...prev, [key]: true }))
      return
    }
    if (kind === 'post') getPosts()
    else getComments(postId)
  }

  // Shared by every DeleteControl (posts and comments)
  const deleteProps = {
    confirmDelete,
    deleteErrors,
    onRequestDelete: key => {
      setConfirmDelete(key)
      setDeleteErrors(prev => ({ ...prev, [key]: false }))
    },
    onCancelDelete: () => setConfirmDelete(null),
    onDelete: deleteItem,
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeFilter = FEED_FILTERS.find(f => f.key === feedFilter)
  const visiblePosts = activeFilter.category
    ? posts.filter(p => p.category === activeFilter.category)
    : posts

  return (
    <div className="min-h-screen">

      <Header zipCode={profile?.zip_code} loading={!profileLoaded} onCompose={openCompose} />

      <div className="p-4 pb-20">
        {activeTab === 'feed' && (
          <div>
            <ComposeBox
              content={content}
              onContentChange={setContent}
              category={category}
              onCategoryChange={setCategory}
              isAnonymous={isAnonymous}
              onAnonymousChange={setIsAnonymous}
              onPost={createPost}
              textareaRef={composeRef}
            />

            <FeedFilters activeFilter={feedFilter} onFilterChange={setFeedFilter} />

            {posts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">No posts yet. Be the first!</p>
            ) : visiblePosts.length === 0 ? (
              <p className="text-base text-muted text-center mt-8">
                No {activeFilter.label} posts right now.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {visiblePosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onToggleUpvote={() => toggleUpvote(post)}
                    isExpanded={expandedPost === post.id}
                    // Loaded comments are fresher than the count from the last feed fetch
                    replyCount={comments[post.id]?.length ?? post.comment_count}
                    onToggleComments={() => {
                      setExpandedPost(expandedPost === post.id ? null : post.id)
                      getComments(post.id)
                    }}
                    isReporting={reportingPost === post.id}
                    onToggleReport={() => setReportingPost(reportingPost === post.id ? null : post.id)}
                    onCancelReport={() => setReportingPost(null)}
                    reportStatus={reportedPosts[post.id]}
                    onReport={reason => reportPost(post.id, reason)}
                    deleteProps={deleteProps}
                  >
                    <CommentThread
                      postId={post.id}
                      comments={comments[post.id]}
                      replyTo={replyTo}
                      onToggleReply={commentId => {
                        setReplyTo(replyTo === commentId ? null : commentId)
                        setCommentText('')
                      }}
                      commentText={commentText}
                      onCommentTextChange={setCommentText}
                      commentAnonymous={commentAnonymous}
                      onCommentAnonymousChange={setCommentAnonymous}
                      onAddComment={parentId => addComment(post.id, parentId)}
                      deleteProps={deleteProps}
                    />
                  </PostCard>
                ))}
                <p className="text-sm text-muted text-center py-6">
                  That&apos;s everything on your block for now.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'safety' && <SafetyTab />}
        {activeTab === 'help' && <HelpTab />}
        {activeTab === 'me' && <MeTab profile={profile} onLogout={handleLogout} />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  )
}
