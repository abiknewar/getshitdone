# Get Shit Done

A voice-first task manager **and** daily news brief, in a clean black-and-white
(pixel-microphone) design. Installable as a PWA — add it to your phone's home
screen and it behaves like a native app.

**👉 New here? Follow [SETUP.md](SETUP.md) — a plain-English, click-by-click
guide** to get it live on a URL and installed on your phone.

- 🎙️ **Talk to it.** "Add buy milk and call mom tomorrow." "I finished the report."
  Claude figures out whether you meant add / complete / delete / reschedule —
  even several things in one sentence.
- ✅ **Tasks persist until done.** A "someday" task stays on your list until you
  complete it. Completing it checks it off and clears it from your active list.
- 📰 **Daily Brief.** Each morning it asks if you want the brief: ~12 stories
  across AI, tech, marketing, content and geopolitics — compiled by Claude (web
  search, optionally blended with X) and **read aloud** by an on-device voice.
- ☁️ **Cloud sync.** Log in once; your tasks follow you across devices in real time.
- 📊 **Insights.** Day / week / month / year completion charts, streaks, and rate.
- ⌨️ **Everything is clickable too**, so it works even where the mic doesn't.

## Design

Editorial black & white — heavy display type (Archivo Black), clean line icons,
generous space. The **microphone is the one pixel-art element** (pixel glyph,
pixel equalizer, pixel pulse). Fonts are embedded, so it works offline.

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Vite + React + TypeScript + Tailwind, installable PWA (`vite-plugin-pwa`) |
| Data / auth | Supabase (Postgres + Auth + Row-Level Security + Realtime) |
| Speech → text | Browser Web Speech API (on-device, free) |
| Text → intent | Claude, called from a Supabase Edge Function (`voice-intent`) |
| Daily brief | Claude web search (+ optional X API), Edge Function (`daily-brief`) |
| Narration | Browser SpeechSynthesis (on-device, free) |
| Charts | Recharts |

The Anthropic API key lives **only** on the Edge Function as a secret — it never
touches the browser.

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a free project.
2. In **Settings → API**, copy the **Project URL** and the **anon public** key.
3. Copy `.env.example` to `.env` and paste them in:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://YOUR-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

### 3. Create the database schema

Open the Supabase **SQL Editor** and run the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
(Or, with the Supabase CLI: `supabase db push`.)

This creates the `tasks` table, row-level security so each user only sees their
own tasks, and enables realtime sync.

### 4. Turn on auth providers

In **Authentication → Providers**:

- **Email** is on by default (used for magic-link sign-in).
- Optionally enable **Google** and add your OAuth credentials.

Add your dev/prod URLs to **Authentication → URL Configuration → Redirect URLs**
(e.g. `http://localhost:5173` and your deployed URL).

### 5. Deploy the voice Edge Function

You need the [Supabase CLI](https://supabase.com/docs/guides/cli) and an
[Anthropic API key](https://console.anthropic.com/).

```bash
supabase login
supabase link --project-ref YOUR-REF

# set your Claude key as a secret (never committed, never sent to the browser)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# optional: blend real X/Twitter posts into the daily brief (needs a paid X plan)
# supabase secrets set X_BEARER_TOKEN=...

# deploy both functions
supabase functions deploy voice-intent
supabase functions deploy daily-brief
```

Models: voice parsing defaults to `claude-haiku-4-5-20251001` (fast + cheap);
the daily brief defaults to `claude-sonnet-5` (needs web search). Override with
`GSD_MODEL` and `GSD_BRIEF_MODEL` secrets respectively.

### 6. Run it

```bash
npm run dev
```

Open the printed URL, sign in, tap the mic, and start talking.

> Voice input uses the browser's Web Speech API — best support is in Chrome,
> Edge, Android Chrome and iOS Safari. Everywhere else, use the typed quick-add
> field; all voice actions have button/keyboard equivalents.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint |
| `npm test` | Run unit tests (task-matching + insights logic) |

## How the voice flow works

1. The mic button uses the Web Speech API to transcribe what you say (on-device).
2. The transcript plus a slim list of your open tasks is POSTed to the
   `voice-intent` Edge Function.
3. The function asks Claude (with tool definitions) to return structured actions
   — `add_task`, `complete_task`, `delete_task`, `update_task` — resolving
   references like "the report" to the right task id and dates like "tomorrow"
   to a real date.
4. The app applies those actions to Supabase and shows you a summary. Realtime
   keeps your other devices in sync.

The action-resolution logic lives in [`src/lib/taskLogic.ts`](src/lib/taskLogic.ts)
and is unit-tested — see [`src/lib/taskLogic.test.ts`](src/lib/taskLogic.test.ts).

## Deploying the frontend

The frontend is a static PWA — deploy `dist/` to any static host (Vercel,
Netlify, Cloudflare Pages, GitHub Pages). Set the `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` environment variables in your host, and add the
deployed origin to your Supabase redirect URLs.

## Roadmap (not in v1)

Offline write queue · recurring tasks · reminders / push notifications ·
task sharing · native app wrapper.
