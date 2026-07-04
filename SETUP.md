# Get Shit Done — Step-by-step setup

Follow these in order. By the end you'll have the app **live on a URL** and
**installed on your phone**, with voice control and the daily brief working.

Nothing here needs coding — it's all clicking around in dashboards and copy-paste.

Your live app URL will be: **`https://abiknewar.github.io/getshitdone/`**

---

## What you'll create (all free to start)

| Thing | Why | Cost |
|-------|-----|------|
| Supabase project | Login + stores your tasks + caches the brief | Free tier |
| Anthropic API key | Powers voice commands + writes the daily brief | Pay-as-you-go (cents/day) |
| X (Twitter) API token | *Optional* — blends real X posts into the brief | Paid ($100+/mo) — skip for now |

> You picked "X + web" for the brief. Web search alone works great and needs
> **no** X token. Add the X token later (Step 7) only if you want it.

---

## Step 1 · Create your Supabase project

1. Go to **[supabase.com](https://supabase.com)** → **Start your project** → sign in with GitHub.
2. **New project**. Give it a name (e.g. `getshitdone`), set a database password (save it somewhere), pick a region near you, click **Create**.
3. Wait ~2 minutes for it to spin up.
4. Left sidebar → **Project Settings** (gear) → **API**. Copy these two — you'll need them a few times:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string)

## Step 2 · Create the database tables

1. Left sidebar → **SQL Editor** → **New query**.
2. Open the file `supabase/migrations/0001_init.sql` from this repo, copy all of it, paste into the editor, click **Run**.
3. New query again. Do the same with `supabase/migrations/0002_briefs.sql`. **Run**.

You should see "Success". This created your tasks table + the daily-brief cache, with security so each person only sees their own tasks.

## Step 3 · Turn on sign-in

1. Left sidebar → **Authentication** → **Providers**.
2. **Email** is already on (used for the magic-link login). That's enough to start.
3. *(Optional)* To enable **Google** login, toggle it on and follow Supabase's prompts to add Google OAuth credentials.
4. Left sidebar → **Authentication** → **URL Configuration** → **Redirect URLs** → add:
   - `https://abiknewar.github.io/getshitdone/`
   - `http://localhost:5173` (for testing on your computer)

## Step 4 · Get an Anthropic API key

1. Go to **[console.anthropic.com](https://console.anthropic.com)** → sign up.
2. **Settings → Billing** → add a small amount of credit (e.g. $5 — this lasts a long time for personal use).
3. **API Keys → Create Key**. Copy it (starts with `sk-ant-...`). You won't see it again, so paste it somewhere safe for the next step.

## Step 5 · Install the Supabase CLI (one time)

The CLI lets you deploy the two "functions" (the bits that talk to Claude).

- **Mac:** open Terminal, run `brew install supabase/tap/supabase`
- **Windows:** install [Scoop](https://scoop.sh), then `scoop install supabase`
- Or see [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

Then, in a terminal inside this project folder:

```bash
supabase login                       # opens your browser to authorize
supabase link --project-ref XXXX     # XXXX = the part before .supabase.co in your Project URL
```

## Step 6 · Deploy the two functions + set your Claude key

```bash
# your Claude key from Step 4 — this stays on the server, never in the app
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# deploy the voice + brief functions
supabase functions deploy voice-intent
supabase functions deploy daily-brief
```

That's the backend done — voice commands and the daily brief now work.

## Step 7 · (Optional) Add the X / Twitter feed

Only if you have a paid X API plan and want real X posts blended in:

```bash
supabase secrets set X_BEARER_TOKEN=your-x-bearer-token
```

No token? No problem — the brief uses web search and still covers all five topics.

## Step 8 · Put it live on the internet (GitHub Pages)

1. On GitHub, open this repo → **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
2. Repo → **Settings → Secrets and variables → Actions → New repository secret**. Add two:
   - `VITE_SUPABASE_URL` = your Project URL (Step 1)
   - `VITE_SUPABASE_ANON_KEY` = your anon public key (Step 1)
3. Go to the **Actions** tab → the "Deploy to GitHub Pages" workflow → **Run workflow** (or just push any commit). It builds and publishes automatically.
4. After ~1 minute your app is live at **`https://abiknewar.github.io/getshitdone/`**.

## Step 9 · Install it on your phone

1. Open **`https://abiknewar.github.io/getshitdone/`** in **Chrome (Android)** or **Safari (iPhone)**.
2. **iPhone:** tap the **Share** button → **Add to Home Screen**.
   **Android:** tap the **⋮** menu → **Install app** / **Add to Home screen**.
3. Open it from your home screen — it now runs full-screen like a normal app, and the microphone works (tap **Allow** the first time it asks).

---

## Running on your computer (optional, for testing)

```bash
npm install
cp .env.example .env      # then paste your Supabase URL + anon key into .env
npm run dev               # open the printed http://localhost:5173 link
```

## Everyday use

- **Tasks:** tap the mic and say things ("add buy milk and call mom tomorrow", "I finished the report"), or type. Tasks stay until you complete them.
- **Daily brief:** open the app in the morning — it asks if you want the brief, then reads ~12 stories aloud. Or open the **Brief** tab any time and tap ▶.
- **Insights:** see your streak, completion rate, and weekly/monthly/yearly charts.

## Troubleshooting

- **"Almost there" screen** → the GitHub secrets in Step 8.2 are missing or misspelled. Re-check them and re-run the workflow.
- **Voice does nothing** → make sure Step 6 finished (`voice-intent` deployed, key set) and you tapped **Allow** for the mic.
- **Brief won't load** → make sure `daily-brief` is deployed and the Anthropic key is set; open the Brief tab and tap **Try again**.
- **Costs** → set a spend limit in the Anthropic console. Personal use is typically a few cents a day.
