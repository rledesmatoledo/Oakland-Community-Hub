'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import FeedFilters from '@/components/FeedFilters'
import HelpTab from '@/components/HelpTab'
import ComposeView from '@/components/ComposeView'
import PostCard from '@/components/PostCard'
import PostDetail from '@/components/PostDetail'
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
  const [composeOpen, setComposeOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState(false)
  const [openPostId, setOpenPostId] = useState(null)   // post shown in Post detail
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [comments, setComments] = useState({})
  const [commentAnonymous, setCommentAnonymous] = useState(true)
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [reportingPost, setReportingPost] = useState(null)
  const [reportedPosts, setReportedPosts] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)   // e.g. 'post-12' or 'comment-34'
  const [deleteErrors, setDeleteErrors] = useState({})
  const [feedFilter, setFeedFilter] = useState('all')
  const feedScrollY = useRef(null)   // where the feed was scrolled before opening Compose/detail

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

  // The post shown in Post detail (gone if it was deleted)
  const openPost = openPostId ? posts.find(p => p.id === openPostId) : null
  const fullView = composeOpen ? 'compose' : openPost ? 'detail' : null

  // Back on the feed: return to where it was scrolled
  useEffect(() => {
    if (fullView || feedScrollY.current == null) return
    window.scrollTo(0, feedScrollY.current)
    feedScrollY.current = null
  }, [fullView])

  function leaveFeed() {
    if (activeTab === 'feed' && !fullView) feedScrollY.current = window.scrollY
    window.scrollTo(0, 0)
  }

  function openCompose() {
    leaveFeed()
    setActiveTab('feed')
    setOpenPostId(null)
    setPostError(false)
    setComposeOpen(true)
  }

  function openPostDetail(postId) {
    leaveFeed()
    setOpenPostId(postId)
    setReplyTo(null)
    setCommentText('')
    setReplyError(false)
    getComments(postId)
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
    if (!content.trim() || posting) return
    setPosting(true)
    setPostError(false)
    const { error } = await supabase.from('posts').insert({
      user_id: user?.id,
      content,
      category,
      is_anonymous: isAnonymous,
    })
    setPosting(false)
    if (error) {
      // Keep the draft so nothing is lost
      console.log(error)
      setPostError(true)
      return
    }
    setContent('')
    setIsAnonymous(true)
    setComposeOpen(false)
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
    if (!commentText.trim() || sendingReply) return
    setSendingReply(true)
    setReplyError(false)
    const { error } = await supabase.from('comments').insert({
      user_id: user?.id,
      post_id: postId,
      content: commentText,
      is_anonymous: commentAnonymous,
      parent_id: parentId,
    })
    setSendingReply(false)
    if (error) {
      // Keep the text so nothing is lost
      console.log(error)
      setReplyError(true)
      return
    }
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
    if (kind === 'post') {
      if (id === openPostId) setOpenPostId(null)
      getPosts()
    } else {
      getComments(postId)
    }
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

  // Upvote / Report / Delete props for one post (feed card and detail)
  function actionPropsFor(post) {
    return {
      onToggleUpvote: () => toggleUpvote(post),
      isReporting: reportingPost === post.id,
      onToggleReport: () => setReportingPost(reportingPost === post.id ? null : post.id),
      onCancelReport: () => setReportingPost(null),
      reportStatus: reportedPosts[post.id],
      onReport: reason => reportPost(post.id, reason),
      deleteProps,
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeFilter = FEED_FILTERS.find(f => f.key === feedFilter)
  const visiblePosts = activeFilter.category
    ? posts.filter(p => p.category === activeFilter.category)
    : posts

  if (fullView === 'compose') {
    return (
      <div className="min-h-screen">
        <ComposeView
          content={content}
          onContentChange={setContent}
          category={category}
          onCategoryChange={setCategory}
          isAnonymous={isAnonymous}
          onAnonymousChange={setIsAnonymous}
          onPost={createPost}
          onCancel={() => setComposeOpen(false)}
          posting={posting}
          postError={postError}
        />
      </div>
    )
  }

  if (fullView === 'detail') {
    return (
      <div className="min-h-screen">
        <PostDetail
          post={openPost}
          onBack={() => setOpenPostId(null)}
          actionProps={actionPropsFor(openPost)}
          comments={comments[openPost.id]}
          replyTo={replyTo}
          onReplyTo={commentId => {
            setReplyTo(replyTo === commentId ? null : commentId)
            setCommentText('')
            setReplyError(false)
          }}
          commentText={commentText}
          onCommentTextChange={setCommentText}
          commentAnonymous={commentAnonymous}
          onCommentAnonymousChange={setCommentAnonymous}
          onAddComment={() => addComment(openPost.id, replyTo)}
          sendingReply={sendingReply}
          replyError={replyError}
          deleteProps={deleteProps}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      <Header zipCode={profile?.zip_code} loading={!profileLoaded} onCompose={openCompose} />

      <div className="p-4 pb-20">
        {activeTab === 'feed' && (
          <div>
            <FeedFilters activeFilter={feedFilter} onFilterChange={setFeedFilter} />

            {posts.length === 0 ? (
              <p className="text-base text-muted text-center mt-8">No posts yet. Be the first!</p>
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
                    // Loaded comments are fresher than the count from the last feed fetch
                    replyCount={comments[post.id]?.length ?? post.comment_count}
                    onOpen={() => openPostDetail(post.id)}
                    actionProps={actionPropsFor(post)}
                  />
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
        {activeTab === 'me' && <MeTab profile={profile} loading={!profileLoaded} onLogout={handleLogout} />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  )
}
