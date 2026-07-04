import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { useBrief } from './useBrief'
import { CATEGORY_LABEL, type BriefCategory, type BriefItem } from '../../lib/brief'
import { isNarrationSupported, speakSequence, stopNarration, type Narrator } from '../../lib/narrate'
import { PlayIcon, StopIcon } from '../../components/icons'
import { EmptyState } from '../../components/EmptyState'

const CATS: (BriefCategory | 'all')[] = ['all', 'AI', 'TECH', 'MARKETING', 'CONTENT', 'WORLD']

function itemToSpeech(it: BriefItem, i: number): string {
  return `Story ${i + 1}. ${it.headline}. ${it.summary}`
}

export function BriefView() {
  const { items, loading, error, load, loaded } = useBrief()
  const [cat, setCat] = useState<BriefCategory | 'all'>('all')
  const [speakingAll, setSpeakingAll] = useState(false)
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)
  const narrator = useRef<Narrator | null>(null)
  const location = useLocation()

  // Load today's brief when the screen first opens.
  useEffect(() => {
    if (!loaded) load()
  }, [loaded, load])

  // If we arrived via the morning popup, auto-play once items are ready.
  const autoNarrate = (location.state as { narrate?: boolean } | null)?.narrate
  useEffect(() => {
    if (autoNarrate && items.length && !speakingAll) {
      playAll()
      // clear so it doesn't replay on re-render
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNarrate, items.length])

  useEffect(() => () => stopNarration(), [])

  const filtered = useMemo(
    () => (cat === 'all' ? items : items.filter((i) => i.category === cat)),
    [items, cat],
  )

  function stopAll() {
    narrator.current?.stop()
    narrator.current = null
    setSpeakingAll(false)
    setSpeakingIdx(null)
  }

  function playAll() {
    if (!isNarrationSupported()) return
    stopAll()
    const lines = [
      `Here is your daily brief. ${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}.`,
      ...filtered.map(itemToSpeech),
    ]
    setSpeakingAll(true)
    narrator.current = speakSequence(lines, () => {
      setSpeakingAll(false)
      narrator.current = null
    })
  }

  function playOne(it: BriefItem, idx: number) {
    if (!isNarrationSupported()) return
    stopAll()
    setSpeakingIdx(idx)
    narrator.current = speakSequence([`${it.headline}. ${it.summary}`], () => {
      setSpeakingIdx(null)
      narrator.current = null
    })
  }

  const estMin = Math.max(1, Math.round(items.length * 0.5))

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <p className="eyebrow">{format(new Date(), 'EEE · MMM d · HH:mm')}</p>
        <h1 className="font-display text-3xl tracking-tight">Daily Brief</h1>
      </header>

      {/* narrate bar */}
      {items.length > 0 && (
        <div className="flex items-center gap-3.5 rounded-2xl bg-ink p-4 text-white">
          <button
            type="button"
            onClick={speakingAll ? stopAll : playAll}
            aria-label={speakingAll ? 'Stop narration' : 'Play the brief'}
            className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white text-ink"
          >
            {speakingAll ? <PlayIconStop /> : <PlayIcon className="h-5 w-5" />}
          </button>
          <div className="min-w-0">
            <div className="font-display text-[15px]">{speakingAll ? 'Narrating…' : 'Play the brief'}</div>
            <div className="font-mono text-[11px] text-white/60">
              {items.length} stories · ~{estMin} min · AI voice
            </div>
          </div>
          <div className="ml-auto flex h-5 items-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((b) => (
              <span
                key={b}
                className={'w-[3px] bg-white/70 ' + (speakingAll ? 'animate-eq' : '')}
                style={{ height: '6px', animationDelay: `${b * 0.08}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* category chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={
                'rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ' +
                (cat === c
                  ? 'border-ink bg-ink text-white'
                  : 'border-line-2 bg-paper text-muted hover:text-ink')
              }
            >
              {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      )}

      {/* states */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          <p className="text-sm text-muted">Gathering today's brief…</p>
        </div>
      )}

      {!loading && error && (
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <p className="font-semibold">Couldn't load the brief</p>
          <p className="max-w-xs text-sm text-muted">{error}</p>
          <p className="max-w-xs text-xs text-faint">
            The brief needs the <span className="font-mono">daily-brief</span> function deployed and an
            Anthropic key set. See SETUP.md.
          </p>
          <button className="btn-ghost mt-1" onClick={() => load(true)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState title="No brief yet" hint="Tap to generate today's brief." />
      )}

      {/* list */}
      {!loading && !error && filtered.length > 0 && (
        <ul className="flex flex-col">
          {filtered.map((it, idx) => (
            <li key={idx} className="flex gap-3 border-t border-line py-4 first:border-t-0">
              <span className="w-6 flex-none pt-1 font-mono text-xs text-faint">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-white">
                  {CATEGORY_LABEL[it.category] ?? it.category}
                </span>
                <h3 className="mt-2 font-display text-base leading-tight tracking-tight">{it.headline}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{it.summary}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-faint">{it.source}</span>
                  <button
                    type="button"
                    onClick={() => (speakingIdx === idx ? stopAll() : playOne(it, idx))}
                    className={
                      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-colors ' +
                      (speakingIdx === idx
                        ? 'border-ink bg-ink text-white'
                        : 'border-line-2 bg-paper text-ink hover:bg-ink hover:text-white')
                    }
                  >
                    {speakingIdx === idx ? <StopIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
                    {speakingIdx === idx ? 'Stop' : 'Listen'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isNarrationSupported() && items.length > 0 && (
        <p className="text-center text-xs text-faint">Voice narration isn't supported in this browser.</p>
      )}
    </div>
  )
}

function PlayIconStop() {
  return <StopIcon className="h-4 w-4" />
}
