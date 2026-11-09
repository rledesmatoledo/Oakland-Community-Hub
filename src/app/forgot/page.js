"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const redirectTo = window.location.origin + '/reset'
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a password reset link.')
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reset your password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter the email for your account and we&apos;ll send a reset link.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 text-white rounded-lg py-3 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
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
