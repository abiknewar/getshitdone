import { useEffect, useRef, useState } from 'react'
import { isSpeechSupported, startDictation, type Dictation } from '../../lib/speech'
import { useToast } from '../../components/Toast'

interface Props {
  onTranscript: (text: string) => void
  busy?: boolean
}

/** Pixel-art microphone glyph (the one pixel element in the app). */
function PixelMic({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="1" width="4" height="7" />
      <rect x="5" y="7" width="1" height="1" />
      <rect x="10" y="7" width="1" height="1" />
      <rect x="4" y="8" width="8" height="1" />
      <rect x="7" y="9" width="2" height="3" />
      <rect x="5" y="12" width="6" height="1" />
    </svg>
  )
}

export function MicButton({ onTranscript, busy = false }: Props) {
  const [listening, setListening] = useState(false)
  const [partial, setPartial] = useState('')
  const dictationRef = useRef<Dictation | null>(null)
  const toast = useToast()
  const supported = isSpeechSupported()

  useEffect(() => () => dictationRef.current?.stop(), [])

  function toggle() {
    if (busy) return
    if (listening) {
      dictationRef.current?.stop()
      return
    }
    setPartial('')
    const d = startDictation({
      onPartial: setPartial,
      onFinal: (text) => onTranscript(text),
      onError: (msg) => {
        toast(msg, 'error')
        setListening(false)
      },
      onEnd: () => {
        setListening(false)
        setPartial('')
      },
    })
    if (d) {
      dictationRef.current = d
      setListening(true)
    }
  }

  const bars = [0, 1, 2, 3, 4, 5, 6]
  const delays = ['0s', '.08s', '.18s', '.03s', '.22s', '.12s', '.26s']

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {(listening || partial) && (
        <div className="min-h-[1.25rem] max-w-[16rem] text-center text-sm text-muted">
          {partial || 'Listening…'}
        </div>
      )}

      <div className="relative grid h-[132px] w-[132px] place-items-center">
        {listening && (
          <>
            <span className="absolute h-full w-full border-4 border-ink animate-pring" aria-hidden="true" />
            <span
              className="absolute h-full w-full border-4 border-ink animate-pring"
              style={{ animationDelay: '.5s' }}
              aria-hidden="true"
            />
          </>
        )}
        <button
          type="button"
          onClick={toggle}
          disabled={busy || !supported}
          aria-pressed={listening}
          aria-label={listening ? 'Stop listening' : 'Start voice command'}
          className={
            'relative z-10 grid h-[92px] w-[92px] place-items-center rounded-full transition-transform active:scale-95 ' +
            (listening
              ? 'bg-paper text-ink shadow-[0_0_0_3px_#0E0E0E]'
              : 'bg-ink text-white shadow-[0_10px_26px_-8px_rgba(0,0,0,0.5)]')
          }
        >
          {busy ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PixelMic />
          )}
        </button>
      </div>

      <div className="flex h-[26px] items-end gap-[5px]" aria-hidden="true">
        {bars.map((b, i) => (
          <span
            key={b}
            className={'block w-[7px] bg-ink ' + (listening ? 'animate-eq' : '')}
            style={{ height: '7px', animationDelay: listening ? delays[i] : undefined }}
          />
        ))}
      </div>

      <p className="font-pixel text-[9px] tracking-wide text-muted">
        {!supported ? 'VOICE NEEDS THE INSTALLED APP' : busy ? 'THINKING…' : listening ? 'TAP TO STOP' : 'TAP TO SPEAK'}
      </p>
    </div>
  )
}
