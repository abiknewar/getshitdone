// Supabase Edge Function: daily-brief
// Builds a 10-12 story daily brief across AI / Tech / Marketing / Content /
// Geopolitics using Claude's web search, optionally blended with recent X
// (Twitter) posts. Caches one row per day in `daily_briefs` so it only runs
// once per day. Keys stay server-side.
//
// Secrets:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase secrets set X_BEARER_TOKEN=...        (optional — blends in X posts)
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically)
//
// Deploy:  supabase functions deploy daily-brief

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const X_BEARER_TOKEN = Deno.env.get('X_BEARER_TOKEN') ?? ''
const MODEL = Deno.env.get('GSD_BRIEF_MODEL') ?? 'claude-sonnet-5'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const CATEGORIES = ['AI', 'TECH', 'MARKETING', 'CONTENT', 'WORLD'] as const

const publishTool = {
  name: 'publish_brief',
  description: 'Return the finished daily brief as 10 to 12 structured stories.',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        minItems: 10,
        maxItems: 12,
        items: {
          type: 'object',
          properties: {
            category: { type: 'string', enum: CATEGORIES },
            headline: { type: 'string', description: 'Punchy, specific, <= 90 chars.' },
            summary: { type: 'string', description: '1-2 sentences of what happened and why it matters.' },
            source: { type: 'string', description: 'Publication + relative time, e.g. "Reuters · 3h".' },
            url: { type: 'string' },
          },
          required: ['category', 'headline', 'summary', 'source'],
        },
      },
    },
    required: ['items'],
  },
}

/** Optionally pull a few recent X posts to blend into the brief. */
async function fetchXContext(): Promise<string> {
  if (!X_BEARER_TOKEN) return ''
  const queries = [
    '(AI OR LLM OR "artificial intelligence") -is:retweet lang:en',
    '(technology OR startup OR chips) -is:retweet lang:en',
    '(marketing OR advertising OR SEO) -is:retweet lang:en',
    '(geopolitics OR economy OR policy) -is:retweet lang:en',
  ]
  const lines: string[] = []
  for (const q of queries) {
    try {
      const url = new URL('https://api.twitter.com/2/tweets/search/recent')
      url.searchParams.set('query', q)
      url.searchParams.set('max_results', '10')
      url.searchParams.set('tweet.fields', 'public_metrics,created_at')
      const res = await fetch(url, { headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` } })
      if (!res.ok) continue
      const data = await res.json()
      for (const t of data?.data ?? []) {
        const likes = t.public_metrics?.like_count ?? 0
        if (likes < 50) continue // keep it signal-heavy
        lines.push(`- (${likes}♥) ${String(t.text).replace(/\s+/g, ' ').slice(0, 220)}`)
      }
    } catch {
      /* ignore a failing query */
    }
  }
  return lines.slice(0, 40).join('\n')
}

async function generateBrief(date: string): Promise<any[]> {
  const xContext = await fetchXContext()
  const system = [
    `You are the newsroom for a daily brief, compiled on ${date}.`,
    'Use web search to find the most important, genuinely recent developments (last ~24-48h)',
    'across these five beats: AI, TECH (technology/hardware/startups), MARKETING (marketing/ads/growth),',
    'CONTENT (media/creators/publishing), and WORLD (geopolitics/economy/policy).',
    'Aim for balanced coverage — roughly 2-3 stories per beat, 10-12 total.',
    'Prefer concrete, sourced facts over vibes. Keep summaries tight and useful.',
    'When done searching, call publish_brief exactly once with the final list.',
    xContext
      ? `\nRecent notable posts on X for extra signal (verify against reputable sources before using):\n${xContext}`
      : '',
  ].join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }, publishTool],
      messages: [
        {
          role: 'user',
          content: `Compile today's brief for ${date}. Search the web for the latest across all five beats, then call publish_brief.`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Claude request failed: ${res.status} ${detail}`)
  }

  const data = await res.json()
  for (const block of data.content ?? []) {
    if (block.type === 'tool_use' && block.name === 'publish_brief') {
      const items = block.input?.items
      if (Array.isArray(items) && items.length) return items
    }
  }
  throw new Error('The model did not return a structured brief.')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY is not set on the function.' }, 500)

  let body: { date?: string; force?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    /* empty body is fine */
  }
  const date = body.date ?? new Date().toISOString().slice(0, 10)

  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  // Serve cached brief unless a refresh was requested.
  if (!body.force) {
    const { data: existing } = await db
      .from('daily_briefs')
      .select('brief_date, items, generated_at')
      .eq('brief_date', date)
      .maybeSingle()
    if (existing && Array.isArray(existing.items) && existing.items.length) {
      return json({ date, items: existing.items, generated_at: existing.generated_at })
    }
  }

  let items: any[]
  try {
    items = await generateBrief(date)
  } catch (e) {
    return json({ error: (e as Error).message }, 502)
  }

  const generated_at = new Date().toISOString()
  await db.from('daily_briefs').upsert({ brief_date: date, items, generated_at }, { onConflict: 'brief_date' })

  return json({ date, items, generated_at })
})
