import { Logo } from './Logo'

export function SetupScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-14 w-14 rounded-2xl" />
          <h1 className="font-display text-2xl tracking-tight">Almost there</h1>
          <p className="text-sm text-muted">
            Get Shit Done needs to be connected to your own Supabase project before it can
            store tasks.
          </p>
        </div>
        <div className="card flex flex-col gap-3 p-5 text-sm">
          <p className="text-muted">Create a <code className="font-mono text-ink">.env</code> file with:</p>
          <pre className="overflow-x-auto rounded-lg bg-paper-2 p-3 font-mono text-xs">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="text-muted">
            Then restart the dev server. Full step-by-step setup is in{' '}
            <span className="text-ink">SETUP.md</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
