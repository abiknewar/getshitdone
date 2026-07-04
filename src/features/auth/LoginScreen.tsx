import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Logo } from '../../components/Logo'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
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
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand px-6">
      <div className="pixels-lg absolute inset-0 text-white/20" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-16 w-16 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-white">Get Shit Done</h1>
          <p className="pixel-label text-xs text-white/80">Talk to it. Get shit done.</p>
        </div>

        {status === 'sent' ? (
          <div className="card p-6 text-center text-sm">
            <p className="mb-1 font-medium text-good">Check your inbox ✉️</p>
            <p className="text-muted">
              We sent a magic sign-in link to <span className="text-text">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="card flex flex-col gap-3 p-5">
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
            {error && <p className="text-sm text-bad">{error}</p>}

            <div className="my-1 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <button type="button" onClick={signInWithGoogle} className="btn-ghost border border-border">
              Continue with Google
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
