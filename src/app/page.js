'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [upvotes, setUpvotes] = useState({})
  const [userUpvotes,setUserUpvotes] = useState([])
  const [replyTo, setReplyTo] = useState(null)


  useEffect(() => {
    getUser()
    getPosts()
    getUpVotes()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/login')
    setUser(user)
  }

  async function getPosts() {
  const { data } = await supabase.from('posts')
    .select('*, profiles(username, zip_code),comments(id, content, is_anonymous, created_at, parent_id, profiles(username))')
    .order('created_at', { ascending: false })
  setPosts(data || []) 
}

  async function createPost() {
  if (!content.trim()) return
  const { error } = await supabase.from('posts').insert({
    user_id: user?.id,
    content,
    category,
    is_anonymous: isAnonymous,
  })
  if(error) console.log(error)
  setContent('')
  setIsAnonymous(false)
  getPosts()
}

async function getUpVotes() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('upvotes').select('post_id, user_id')
  if(!data) return

  const upvotesCount = {}
  const userUpvotes = []
  
  data.forEach(v => {
    upvotesCount[v.post_id] = (upvotesCount[v.post_id] || 0) + 1
    if(v.user_id === user.id) userUpvotes.push(v.post_id)
  })
setUpvotes(upvotesCount)
setUserUpvotes(userUpvotes)
}

async function toggleUpvote(postId) {
  if(userUpvotes.includes(postId)) {
    await supabase.from('upvotes')
    .delete().eq('post_id', postId).eq('user_id', user.id)
  } else {
    await supabase.from('upvotes')
    .insert({ post_id: postId, user_id: user.id })
  }
  getUpVotes()
}

async function addComment(postId,parentId = null) {
  if (!commentText.trim()) return
  const { error } = await supabase.from('comments').insert({
    user_id: user?.id,
    post_id: postId,
    content: commentText,
    is_anonymous: isAnonymous,
    parent_id: parentId,
  })
  if (error) console.log(error)
  setCommentText('')
  setReplyTo(null)
  getPosts()

}

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-green-900 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Oakland Community Hub</h1>
          <button onClick={handleLogout} className="text-xs text-green-300 hover:text-white">
            Sign out
          </button>
        </div>
      </div>

      <div className="p-4 pb-20">
        {activeTab === 'feed' && (
  <div>
    
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <textarea
        value={content}        
        onChange={e => setContent(e.target.value)}
        placeholder="Share something with your neighborhood..."
        className="w-full text-sm text-gray-900 outline-none resize-none placeholder-gray-400"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        {['general','safety','events','resources'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1 rounded-full border capitalize ${
              category === cat
                ? cat === 'safety' ? 'bg-red-500 text-white border-red-500' :
                  cat === 'events' ? 'bg-blue-500 text-white border-blue-500' :
                  cat === 'resources' ? 'bg-amber-500 text-white border-amber-500' :
                  'bg-green-800 text-white border-green-800'
                : 'text-gray-500 border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
         <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="w-3 h-3 accent-green-800"
          />
          <span className="text-xs text-gray-500">Post anonymously</span>
        </label>
        <button onClick={createPost} className="bg-green-800 text-white text-xs px-4 py-2 rounded-full">
          Post
        </button>
      </div>
    </div>
    
    {posts.length === 0 ? (
  // no posts yet - show empty message
  <p className="text-sm text-gray-400 text-center mt-8">No posts yet. Be the first!</p>
) : (
  // loop through every post and render a card
  <div className="flex flex-col gap-3">
    {posts.map(post => (
      <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
        
        {/* header row - avatar, username, date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* first letter of username as avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
            post.is_anonymous ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'
              }`}>
            {post.is_anonymous ? '?' : post.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-gray-700">
            {post.is_anonymous
              ? 'Anonymous · ' + (post.profiles?.zip_code || 'Oakland')
            : post.profiles?.username || 'Oakland Resident'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

       {/* post text */}
        <p className="text-gray-900 text-sm mb-2">{post.content}</p>

        {/* bottom row - badge and action buttons */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
            post.category === 'safety' ? 'bg-red-100 text-red-700' :
            post.category === 'events' ? 'bg-blue-100 text-blue-700' :
            post.category === 'resources' ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {post.category}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleUpvote(post.id)}
              className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border ${
              userUpvotes.includes(post.id) 
              ?  'text-green-700 border-green-200 bg-green-50' 
                 : 'text-gray-400 border-gray-200'
             }`}
>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={userUpvotes.includes(post.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
           <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {upvotes[post.id] || 0}
            </button>
            <button
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              className="text-xs text-gray-400"
            >
               Comment
            </button>
            <button className="text-xs text-gray-400 hover:text-red-400">
              ⚑ Report
            </button>
          </div>
        </div>

        {/* comments section */}
        {expandedPost === post.id && (
          <div className="mt-3 border-t border-gray-100 pt-3">

            {/* existing comments */}
            {post.comments?.filter(c => !c.parent_id).map(comment => (
              <div key={comment.id} className="mb-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-800 flex-shrink-0">
                    {comment.is_anonymous ? '?' : comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-medium text-gray-700">
                      {comment.is_anonymous ? 'Anonymous' : comment.profiles?.username || 'Oakland Resident'}
                    </span>
                    <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>

                {/* replies */}
                {post.comments?.filter(r => r.parent_id === comment.id).map(reply => (
                  <div key={reply.id} className="ml-8 mt-2 flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                      {reply.is_anonymous ? '?' : reply.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs font-medium text-gray-700">
                        {reply.is_anonymous ? 'Anonymous' : reply.profiles?.username || 'Oakland Resident'}
                      </span>
                      <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {/* reply button */}
                <button
                  onClick={() => {
                    setReplyTo(replyTo === comment.id ? null : comment.id)
                    setCommentText('')
                  }}
                  className="text-xs text-gray-400 ml-8 mt-1 hover:text-green-700"
                >
                  ↩ Reply
                </button>

                {/* reply input */}
                {replyTo === comment.id && (
                  <div className="ml-8 mt-2 flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      onClick={() => addComment(post.id, comment.id)}
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
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 outline-none text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={() => addComment(post.id, null)}
                  className="bg-green-800 text-white text-xs px-3 py-2 rounded-full"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
)}
</div>
)}

        {activeTab === 'crime' && <div>Crime goes here</div>}
        {activeTab === 'events' && <div>Events goes here</div>}
        {activeTab === 'map' && <div>Map goes here</div>}
        {activeTab === 'profile' && <div>Profile goes here</div>}
      </div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex">
        {['feed','crime','events','map','profile'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-medium capitalize ${
              activeTab === tab ? 'text-green-800' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    </div>
  )
}
