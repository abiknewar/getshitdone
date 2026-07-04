import { useCallback, useRef, useState } from 'react'
import { fetchTodayBrief, type BriefItem } from '../../lib/brief'

interface State {
  items: BriefItem[]
  loading: boolean
  error: string | null
  generatedAt: string | null
  loaded: boolean
}

export function useBrief() {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
    generatedAt: null,
    loaded: false,
  })
  const inflight = useRef(false)

  const load = useCallback(async (force = false) => {
    if (inflight.current) return
    inflight.current = true
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const brief = await fetchTodayBrief(force)
      setState({
        items: brief.items ?? [],
        loading: false,
        error: null,
        generatedAt: brief.generated_at ?? null,
        loaded: true,
      })
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        loaded: true,
        error: e?.message ?? 'Could not load the brief.',
      }))
    } finally {
      inflight.current = false
    }
  }, [])

  return { ...state, load }
}
