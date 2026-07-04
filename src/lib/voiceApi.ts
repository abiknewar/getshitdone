import { supabase } from './supabase'
import type { Task, VoiceIntentResponse } from './types'

/**
 * Send a spoken transcript to the `voice-intent` Supabase Edge Function, which
 * asks Claude to turn it into structured task actions. We pass a slim view of
 * the user's active tasks so Claude can resolve references like "the report".
 */
export async function interpretVoice(
  transcript: string,
  activeTasks: Task[],
): Promise<VoiceIntentResponse> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase.functions.invoke<VoiceIntentResponse>('voice-intent', {
    body: {
      transcript,
      today,
      tasks: activeTasks
        .filter((t) => t.status === 'active')
        .map((t) => ({ id: t.id, title: t.title, due_date: t.due_date })),
    },
  })
  if (error) throw error
  if (!data) throw new Error('No response from voice service.')
  return data
}
