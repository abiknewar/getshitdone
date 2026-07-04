import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from './features/auth/AuthProvider'
import { LoginScreen } from './features/auth/LoginScreen'
import { SetupScreen } from './components/SetupScreen'
import { NavBar } from './components/NavBar'
import { Logo } from './components/Logo'
import { ToastProvider } from './components/Toast'
import { TasksProvider } from './features/tasks/TasksContext'
import { TodayView } from './features/tasks/TodayView'
import { AllView } from './features/tasks/AllView'
import { BriefView } from './features/brief/BriefView'
import { MorningPopup } from './features/brief/MorningPopup'
import { UpdatePrompt } from './components/UpdatePrompt'

// Insights pulls in the charting library — load it only when visited.
const InsightsView = lazy(() =>
  import('./features/insights/InsightsView').then((m) => ({ default: m.InsightsView })),
)

export default function App() {
  return (
    <>
      <AppBody />
      {/* Always mounted so a new deploy can offer to refresh on any screen. */}
      <UpdatePrompt />
    </>
  )
}

function AppBody() {
  const { configured, loading, session, user, signOut } = useAuth()

  if (!configured) return <SetupScreen />

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Logo className="h-12 w-12 animate-pulse" />
      </div>
    )
  }

  if (!session || !user) return <LoginScreen />

  return (
    <ToastProvider>
      <TasksProvider userId={user.id}>
        <div className="mx-auto min-h-screen max-w-md px-4 pb-24">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7 rounded-lg" />
              <span className="font-display text-[15px] tracking-tight">Get Shit Done</span>
            </div>
            <button onClick={signOut} className="text-xs text-muted hover:text-ink">
              Sign out
            </button>
          </div>

          <Suspense fallback={<p className="py-8 text-center text-sm text-muted">Loading…</p>}>
            <Routes>
              <Route path="/" element={<TodayView />} />
              <Route path="/all" element={<AllView />} />
              <Route path="/brief" element={<BriefView />} />
              <Route path="/insights" element={<InsightsView />} />
            </Routes>
          </Suspense>
        </div>
        <NavBar />
        <MorningPopup />
      </TasksProvider>
    </ToastProvider>
  )
}
