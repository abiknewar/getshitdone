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
        <div className="min-h-[1.5rem] max-w-xs text-center text-sm text-white/90">
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
          'relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand shadow-lg transition-all ' +
          (listening ? 'scale-105 text-brand-deep' : 'hover:scale-105')
        }
      >
        {listening && (
          <span className="absolute inset-0 rounded-full bg-white/50 animate-pulseRing" aria-hidden="true" />
        )}
        {busy ? (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <MicIcon className="h-8 w-8" />
        )}
      </button>

      <p className="pixel-label text-[11px] text-white/80">
        {!supported
          ? 'Voice not supported — type below'
          : busy
            ? 'Thinking…'
            : listening
              ? 'Tap to stop'
              : 'Tap and speak'}
      </p>
    </div>
  )
}
