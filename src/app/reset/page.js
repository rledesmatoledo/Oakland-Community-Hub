"use client"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { ErrorNotice, SuccessNotice, inputClass, primaryButtonClass, linkClass, helperClass } from '@/components/AuthShell'

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
    <AuthShell
      title="Create a new password"
      subtitle="Enter a new password to finish resetting your account."
    >
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {message && <SuccessNotice>{message}</SuccessNotice>}

      {status === 'checking' && (
        <p className={`${helperClass} mb-4`}>Verifying your reset link...</p>
      )}
      {status === 'invalid' && !message && (
        <p className="text-base text-muted mb-4">
          This reset link is invalid or has expired.{' '}
          <Link href="/forgot" className={linkClass}>Request a new one</Link>.
        </p>
      )}

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="New password"
            aria-label="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-describedby="password-hint"
            className={inputClass}
            minLength={8}
            required
          />
          <p id="password-hint" className={helperClass}>
            At least 8 characters, with uppercase, lowercase, and a number.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || status !== 'ready'}
          className={primaryButtonClass}
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <p className={`text-center ${helperClass} mt-6`}>
        Back to{' '}
        <Link href="/login" className={linkClass}>Sign in</Link>
      </p>
    </AuthShell>
  )
}
