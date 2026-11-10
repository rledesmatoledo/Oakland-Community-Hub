'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { ErrorNotice, SuccessNotice, inputClass, primaryButtonClass, linkClass, helperClass } from '@/components/AuthShell'
import { Turnstile } from '@marsidev/react-turnstile'

const OAKLAND_ZIPS = ['94601','94602','94603','94604','94605','94606','94607','94608','94609','94610','94611','94612','94613','94614','94615','94617','94618','94619','94620','94621']

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (!OAKLAND_ZIPS.includes(zipCode)) {
      setError('This app is for Oakland residents only. Please enter a valid Oakland zip code.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
         email, 
         password,
         options: {
            captchaToken,
            data: {
                username,
                zip_code: zipCode,
            }
         }
        })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      // Tokens are single-use: get a fresh one for the next attempt
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      return
    }

    // Email confirmation is on: no session until the user clicks the link
    if (!data.session) {
      setMessage('Check your email to confirm your account, then sign in.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <AuthShell title="Join Oakland Hub" subtitle="For Oakland residents only">
      {error && <ErrorNotice>{error}</ErrorNotice>}

      {message && <SuccessNotice>{message}</SuccessNotice>}

      {!message && (
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input type="text" placeholder="Username" aria-label="Username" value={username}
            onChange={e => setUsername(e.target.value)}
            className={inputClass} required />
          <input type="email" placeholder="Email" aria-label="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass} required />
          <div className="flex flex-col gap-1">
            <input type="password" placeholder="Password" aria-label="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              aria-describedby="password-hint"
              minLength={8}
              className={inputClass} required />
            <p id="password-hint" className={helperClass}>
              At least 8 characters, with uppercase, lowercase, and a number.
            </p>
          </div>
          <input type="text" placeholder="Oakland zip code (e.g. 94601)" aria-label="Oakland zip code" value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            className={inputClass} required />
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            options={{ theme: 'light' }}
          />
          <button type="submit" disabled={loading || !captchaToken}
            className={primaryButtonClass}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}

      <p className={`text-center ${helperClass} mt-6`}>
        Already have an account?{' '}
        <Link href="/login" className={linkClass}>Sign in</Link>
      </p>
    </AuthShell>
  )
}
