import { Logo } from './Logo'

export function SetupScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-14 w-14" />
          <h1 className="text-xl font-bold">Almost there</h1>
          <p className="text-sm text-muted">
            Get Shit Done needs to be connected to your own Supabase project before it can
            store tasks.
          </p>
        </div>
        <div className="card flex flex-col gap-3 p-5 text-sm">
          <p className="text-muted">Create a <code className="text-brand">.env</code> file with:</p>
          <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 text-xs">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="text-muted">
            Then restart the dev server. Full step-by-step setup is in{' '}
            <span className="text-text">README.md</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
