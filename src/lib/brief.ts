import { supabase } from './supabase'

export type BriefCategory = 'AI' | 'TECH' | 'MARKETING' | 'CONTENT' | 'WORLD'

export const CATEGORY_LABEL: Record<BriefCategory, string> = {
  AI: 'AI',
  TECH: 'Tech',
  MARKETING: 'Marketing',
  CONTENT: 'Content',
  WORLD: 'Geopolitics',
}

export interface BriefItem {
  category: BriefCategory
  headline: string
  summary: string
  source: string
  url?: string
}

export interface DailyBrief {
  date: string // yyyy-mm-dd
  items: BriefItem[]
  generated_at?: string
}

/**
 * Fetch (and, server-side, generate + cache if missing) today's brief.
 * The `daily-brief` Edge Function does the work so API keys stay off the client.
 */
export async function fetchTodayBrief(force = false): Promise<DailyBrief> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase.functions.invoke<DailyBrief>('daily-brief', {
    body: { date: today, force },
  })
  if (error) throw error
  if (!data) throw new Error('No brief returned.')
  return data
}
