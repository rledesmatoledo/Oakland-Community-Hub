"use client"
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import AuthShell, { ErrorNotice, SuccessNotice, inputClass, primaryButtonClass, linkClass, helperClass } from '@/components/AuthShell'
import { Turnstile } from '@marsidev/react-turnstile'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)

  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const redirectTo = window.location.origin + '/reset'
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo, captchaToken })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a password reset link.')
      }
    } catch (err) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
      // Tokens are single-use. The form stays visible after success too,
      // so reset every time to allow "send again".
      turnstileRef.current?.reset()
      setCaptchaToken(null)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email for your account and we'll send a reset link."
    >
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {message && <SuccessNotice>{message}</SuccessNotice>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass}
          required
        />

        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
          options={{ theme: 'light' }}
        />
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className={primaryButtonClass}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className={`text-center ${helperClass} mt-6`}>
        Back to{' '}
        <Link href="/login" className={linkClass}>Sign in</Link>
      </p>
    </AuthShell>
  )
}
