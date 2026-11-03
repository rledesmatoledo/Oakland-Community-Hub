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
  const [hasToken, setHasToken] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    // Supabase includes the access_token in the URL hash after redirect
    const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
    if (!hash) return
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token) {
      // set session so updateUser works
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        setHasToken(true)
      }).catch((err) => {
        console.error('setSession error', err)
        setError('Unable to set session from reset link.')
      })
    }
  }, [supabase])

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password updated. You can now sign in.')
        // optional: redirect to login after short delay
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

        {!hasToken && !message && (
          <div className="text-sm text-gray-500 mb-4">No reset token found. Make sure you used the link from your email.</div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600"
            required
          />

          <button
            type="submit"
            disabled={loading || !hasToken}
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
