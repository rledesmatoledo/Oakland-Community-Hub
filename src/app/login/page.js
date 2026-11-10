'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { ErrorNotice, inputClass, primaryButtonClass, linkClass, helperClass } from '@/components/AuthShell'
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      // Tokens are single-use: get a fresh one for the next attempt
      turnstileRef.current?.reset()
      setCaptchaToken(null)
    } else {
      router.push('/')
    }
  }

  return (
    <AuthShell title="Sign in to your community">
      {error && <ErrorNotice>{error}</ErrorNotice>}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={inputClass}
          required
        />
        <div className="text-right">
          <Link href="/forgot" className={`text-sm ${linkClass} inline-flex items-center min-h-11`}>Forgot password?</Link>
        </div>
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className={`text-center ${helperClass} mt-6`}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" className={linkClass}>Sign up</Link>
      </p>
    </AuthShell>
  )
}
