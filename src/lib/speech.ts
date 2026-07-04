/**
 * Thin wrapper around the browser Web Speech API (SpeechRecognition).
 * Free, on-device speech-to-text. Supported in Chrome, Edge, Android Chrome
 * and iOS Safari. Firefox does not support it — callers should fall back to
 * the typed quick-add field (see `isSpeechSupported`).
 */

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechSupported(): boolean {
  return getCtor() !== null
}

export interface DictationHandlers {
  /** Fires repeatedly with the best-so-far transcript while speaking. */
  onPartial?: (text: string) => void
  /** Fires once with the final transcript when the user stops. */
  onFinal: (text: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

export interface Dictation {
  stop: () => void
}

/**
 * Start listening. Returns a handle to stop early, or null if unsupported.
 */
export function startDictation(handlers: DictationHandlers): Dictation | null {
  const Ctor = getCtor()
  if (!Ctor) {
    handlers.onError?.('Voice input is not supported in this browser.')
    return null
  }

  const recognition = new Ctor()
  recognition.lang = navigator.language || 'en-US'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  let finalTranscript = ''

  recognition.onresult = (event: any) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const text = result[0]?.transcript ?? ''
      if (result.isFinal) finalTranscript += text
      else interim += text
    }
    handlers.onPartial?.((finalTranscript + interim).trim())
  }

  recognition.onerror = (event: any) => {
    const code = event?.error ?? 'unknown'
    const message =
      code === 'not-allowed' || code === 'service-not-allowed'
        ? 'Microphone permission was denied.'
        : code === 'no-speech'
          ? "Didn't catch that — try again."
          : `Voice error: ${code}`
    handlers.onError?.(message)
  }

  recognition.onend = () => {
    const text = finalTranscript.trim()
    if (text) handlers.onFinal(text)
    handlers.onEnd?.()
  }

  recognition.start()
  return { stop: () => recognition.stop() }
}
