import { useEffect, useRef, useState } from 'react'
import { MicIcon } from '../../components/icons'
import { isSpeechSupported, startDictation, type Dictation } from '../../lib/speech'
import { useToast } from '../../components/Toast'

interface Props {
  onTranscript: (text: string) => void
  busy?: boolean
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

  return (
    <div className="flex flex-col items-center gap-3">
      {(listening || partial) && (
        <div className="min-h-[1.5rem] max-w-xs text-center text-sm text-muted">
          {partial || 'Listening…'}
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={busy || !supported}
        aria-pressed={listening}
        aria-label={listening ? 'Stop listening' : 'Start voice command'}
        className={
          'relative flex h-20 w-20 items-center justify-center rounded-full transition-all ' +
          (listening
            ? 'bg-brand text-white scale-105'
            : 'bg-surface-2 text-brand-soft hover:bg-surface border border-border')
        }
      >
        {listening && (
          <span className="absolute inset-0 rounded-full bg-brand/40 animate-pulseRing" aria-hidden="true" />
        )}
        {busy ? (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <MicIcon className="h-8 w-8" />
        )}
      </button>

      <p className="text-xs text-muted">
        {!supported
          ? 'Voice not supported here — type below'
          : busy
            ? 'Thinking…'
            : listening
              ? 'Tap to stop'
              : 'Tap and speak'}
      </p>
    </div>
  )
}
