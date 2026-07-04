// Supabase Edge Function: voice-intent
// Turns a spoken transcript into structured task actions using Claude.
// The ANTHROPIC_API_KEY lives here as a secret and never reaches the browser.
//
// Deploy:
//   supabase functions deploy voice-intent
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Runs on Deno (Supabase Edge runtime).

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = Deno.env.get('GSD_MODEL') ?? 'claude-haiku-4-5-20251001'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

interface TaskLite {
  id: string
  title: string
  due_date: string | null
}

const tools = [
  {
    name: 'add_task',
    description: 'Create a new task the user wants to do.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short imperative task title.' },
        due_date: {
          type: 'string',
          description:
            'Optional day the task is for, as YYYY-MM-DD. Omit for a "someday" task with no fixed date.',
        },
        notes: { type: 'string', description: 'Optional extra detail.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark an existing task as done. Prefer task_id from the provided list.',
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string', description: 'The id of the matching existing task.' },
        query: { type: 'string', description: 'Fallback text describing the task if unsure of the id.' },
      },
    },
  },
  {
    name: 'delete_task',
    description: 'Remove/cancel an existing task entirely. Prefer task_id from the provided list.',
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string' },
        query: { type: 'string' },
      },
    },
  },
  {
    name: 'update_task',
    description: 'Edit an existing task (rename or reschedule). Prefer task_id from the provided list.',
    input_schema: {
      type: 'object',
      properties: {
        task_id: { type: 'string' },
        query: { type: 'string' },
        title: { type: 'string' },
        due_date: { type: 'string', description: 'New date as YYYY-MM-DD, or empty string to clear.' },
        notes: { type: 'string' },
      },
    },
  },
]

function systemPrompt(today: string, tasks: TaskLite[]): string {
  const list =
    tasks.length === 0
      ? '(the user currently has no open tasks)'
      : tasks.map((t) => `- id=${t.id} | "${t.title}"${t.due_date ? ` (due ${t.due_date})` : ''}`).join('\n')
  return [
    'You are the command engine for "Get Shit Done", a voice task manager.',
    `Today is ${today}. Resolve relative dates ("tomorrow", "next monday", "friday") to YYYY-MM-DD.`,
    'The user speaks freely; convert their utterance into one or more tool calls.',
    'A single utterance can contain several actions — emit a tool call for each.',
    'When completing, deleting, or updating, pick the best matching task from this list and pass its exact task_id:',
    list,
    'If they mention a task that is not in the list, use add_task.',
    'If nothing actionable is said, make no tool calls.',
  ].join('\n')
}

type RawAction =
  | { type: 'add'; title: string; due_date?: string | null; notes?: string | null }
  | { type: 'complete'; task_id?: string; query?: string }
  | { type: 'delete'; task_id?: string; query?: string }
  | { type: 'update'; task_id?: string; query?: string; changes: Record<string, unknown> }

function toAction(name: string, input: Record<string, any>): RawAction | null {
  switch (name) {
    case 'add_task':
      return { type: 'add', title: input.title, due_date: input.due_date ?? null, notes: input.notes ?? null }
    case 'complete_task':
      return { type: 'complete', task_id: input.task_id, query: input.query }
    case 'delete_task':
      return { type: 'delete', task_id: input.task_id, query: input.query }
    case 'update_task': {
      const changes: Record<string, unknown> = {}
      if (input.title !== undefined) changes.title = input.title
      if (input.due_date !== undefined) changes.due_date = input.due_date === '' ? null : input.due_date
      if (input.notes !== undefined) changes.notes = input.notes
      return { type: 'update', task_id: input.task_id, query: input.query, changes }
    }
    default:
      return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!ANTHROPIC_API_KEY) return json({ error: 'ANTHROPIC_API_KEY is not set on the function.' }, 500)

  let payload: { transcript?: string; today?: string; tasks?: TaskLite[] }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const transcript = (payload.transcript ?? '').trim()
  if (!transcript) return json({ error: 'Empty transcript' }, 400)
  const today = payload.today ?? new Date().toISOString().slice(0, 10)
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : []

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt(today, tasks),
      tools,
      messages: [{ role: 'user', content: transcript }],
    }),
  })

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text()
    return json({ error: 'Claude request failed', detail }, 502)
  }

  const data = await anthropicRes.json()
  const actions: RawAction[] = []
  let reply = ''
  for (const block of data.content ?? []) {
    if (block.type === 'text') reply += block.text
    if (block.type === 'tool_use') {
      const action = toAction(block.name, block.input ?? {})
      if (action) actions.push(action)
    }
  }

  return json({ reply: reply.trim(), actions })
})
