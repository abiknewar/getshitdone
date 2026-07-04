import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Logo } from '../../components/Logo'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const redirectTo = window.location.origin + import.meta.env.BASE_URL

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) {
      setError(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <Logo className="h-16 w-16 rounded-2xl" />
          <h1 className="font-display text-3xl tracking-tight">Get Shit Done</h1>
          <p className="eyebrow">Talk to it. Get shit done.</p>
        </div>

        {status === 'sent' ? (
          <div className="card p-6 text-center text-sm">
            <p className="mb-1 font-semibold">Check your inbox ✉️</p>
            <p className="text-muted">
              We sent a magic sign-in link to <span className="text-ink">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              autoComplete="email"
            />
            <button type="submit" className="btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Email me a magic link'}
            </button>
            {error && <p className="text-sm text-ink">{error}</p>}

            <div className="my-1 flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-line-2" /> OR <span className="h-px flex-1 bg-line-2" />
            </div>

            <button type="button" onClick={signInWithGoogle} className="btn-ghost">
              Continue with Google
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
