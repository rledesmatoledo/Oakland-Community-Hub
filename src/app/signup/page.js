'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Join Oakland Hub</h1>
          <p className="text-gray-500 mt-1">For Oakland residents only</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

      {!message && (
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
  <input type="text" placeholder="Username" value={username}
    onChange={e => setUsername(e.target.value)}
    className="border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 placeholder-gray-500 bg-gray-50" required />
  <input type="email" placeholder="Email" value={email}
    onChange={e => setEmail(e.target.value)}
    className="border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 placeholder-gray-500 bg-gray-50" required />
  <div className="flex flex-col gap-1">
    <input type="password" placeholder="Password" value={password}
      onChange={e => setPassword(e.target.value)}
      aria-describedby="password-hint"
      minLength={8}
      className="border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 placeholder-gray-500 bg-gray-50" required />
    <p id="password-hint" className="text-xs text-gray-500">
      At least 8 characters, with uppercase, lowercase, and a number.
    </p>
  </div>
  <input type="text" placeholder="Oakland zip code (e.g. 94601)" value={zipCode}
    onChange={e => setZipCode(e.target.value)}
    className="border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 placeholder-gray-500 bg-gray-50" required />
  <Turnstile
    ref={turnstileRef}
    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
    onSuccess={setCaptchaToken}
    onExpire={() => setCaptchaToken(null)}
    onError={() => setCaptchaToken(null)}
    options={{ theme: 'light' }}
  />
  <button type="submit" disabled={loading || !captchaToken}
    className="bg-green-800 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
    {loading ? 'Creating account...' : 'Create account'}
  </button>
</form>
      )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}