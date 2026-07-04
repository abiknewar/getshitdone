/**
 * Thin wrapper over the browser's built-in speech synthesis (free, on-device).
 * Used to narrate the daily brief aloud.
 */

export function isNarrationSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export interface Narrator {
  stop: () => void
}

/**
 * Speak a sequence of lines back-to-back. `onDone` fires when the whole
 * sequence finishes (or is stopped). Returns a handle to stop early.
 */
export function speakSequence(lines: string[], onDone?: () => void): Narrator | null {
  if (!isNarrationSupported() || lines.length === 0) {
    onDone?.()
    return null
  }
  const synth = window.speechSynthesis
  synth.cancel()

  let stopped = false
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line)
    u.rate = 1.03
    if (i === lines.length - 1) {
      u.onend = () => {
        if (!stopped) onDone?.()
      }
    }
    synth.speak(u)
  })

  return {
    stop: () => {
      stopped = true
      synth.cancel()
      onDone?.()
    },
  }
}

export function stopNarration(): void {
  if (isNarrationSupported()) window.speechSynthesis.cancel()
}
