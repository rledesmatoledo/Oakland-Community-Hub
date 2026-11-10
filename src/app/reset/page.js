"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // 'checking' until Supabase finishes processing the link, then 'ready' or 'invalid'
  const [status, setStatus] = useState('checking')
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    // The Supabase client exchanges the code in the URL on its own and then
    // emits PASSWORD_RECOVERY. INITIAL_SESSION tells us whether a session exists at all.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      } else if (event === 'INITIAL_SESSION') {
        if (session) {
          setStatus('ready')
          return
        }
        // Supabase reports link errors (expired / already used) in the URL
        const params = new URLSearchParams(
          window.location.search + '&' + window.location.hash.substring(1)
        )
        const linkError = params.get('error_description')
        if (linkError) setError(linkError)
        setStatus(prev => (prev === 'ready' ? prev : 'invalid'))
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated. You can now sign in.')
        await supabase.auth.signOut()
        setTimeout(() => router.push('/login'), 1500)
      }
    } catch (err) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create a new password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter a new password to finish resetting your account.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        {status === 'checking' && (
          <div className="text-sm text-gray-500 mb-4">Verifying your reset link...</div>
        )}
        {status === 'invalid' && !message && (
          <div className="text-sm text-gray-500 mb-4">
            This reset link is invalid or has expired.{' '}
            <Link href="/forgot" className="text-green-700 font-medium">Request a new one</Link>.
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-describedby="password-hint"
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600"
              minLength={8}
              required
            />
            <p id="password-hint" className="text-xs text-gray-500">
              At least 8 characters, with uppercase, lowercase, and a number.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || status !== 'ready'}
            className="bg-green-800 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Back to{' '}
          <Link href="/login" className="text-green-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
