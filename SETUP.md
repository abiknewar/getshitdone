# Get Shit Done — setup & updates

Three parts:

- **Part A — Get it on your phone** (do this once)
- **Part B — Everyday use**
- **Part C — Add features & ship an update** (how new features reach your phone)

Nothing needs coding — it's clicking around dashboards and copy-paste.
Your live app URL will be: **`https://abiknewar.github.io/getshitdone/`**

---

# Part A · Get it on your phone

## What you'll create (all free to start)

| Thing | Why | Cost |
|-------|-----|------|
| Supabase project | Login + stores your tasks + caches the brief | Free tier |
| Anthropic API key | Powers voice commands + writes the daily brief | Pay-as-you-go (cents/day) |
| X (Twitter) API token | *Optional* — blends real X posts into the brief | Paid — skip for now |

## A1 · Create your Supabase project
1. Go to **[supabase.com](https://supabase.com)** → **Start your project** → sign in with GitHub.
2. **New project** → name it `getshitdone`, set a database password (save it), pick a nearby region → **Create**. Wait ~2 min.
3. **Project Settings** (gear) → **API**. Copy these — you'll reuse them:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (a long string)

## A2 · Create the database tables
1. **SQL Editor** → **New query**.
2. Copy all of `supabase/migrations/0001_init.sql`, paste, **Run**.
3. New query → do the same with `supabase/migrations/0002_briefs.sql` → **Run**.

## A3 · Turn on sign-in
1. **Authentication → Providers** — **Email** is already on (magic-link login). Enough to start. (Google is optional.)
2. **Authentication → URL Configuration → Redirect URLs** → add:
   - `https://abiknewar.github.io/getshitdone/`
   - `http://localhost:5173`

## A4 · Get an Anthropic API key
1. **[console.anthropic.com](https://console.anthropic.com)** → sign up.
2. **Settings → Billing** → add a little credit (e.g. $5 — lasts a long time for personal use).
3. **API Keys → Create Key** → copy it (`sk-ant-...`) somewhere safe.

## A5 · Install the Supabase CLI (one time)
- **Mac:** `brew install supabase/tap/supabase`
- **Windows:** install [Scoop](https://scoop.sh), then `scoop install supabase`
- Docs: [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

Then, in a terminal inside this project folder:
```bash
supabase login                       # authorizes in your browser
supabase link --project-ref XXXX     # XXXX = the bit before .supabase.co in your Project URL
```

## A6 · Deploy the two functions + set your Claude key
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
# optional (paid X plan): supabase secrets set X_BEARER_TOKEN=your-token
supabase functions deploy voice-intent
supabase functions deploy daily-brief
```

## A7 · Put it live (GitHub Pages)
1. Repo → **Settings → Secrets and variables → Actions → New repository secret**. Add two:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
2. Push any commit (or repo → **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**).
   The workflow tries to **enable Pages automatically**. If it can't (some org settings block it),
   go to **Settings → Pages → Source = GitHub Actions** once, then re-run.
3. After ~1 minute the app is live at **`https://abiknewar.github.io/getshitdone/`**.

## A8 · Install it on your phone
1. Open the live URL in **Chrome (Android)** or **Safari (iPhone)**.
2. **iPhone:** **Share** → **Add to Home Screen**.
   **Android:** you'll see an **Install app** button in the app (or **⋮** menu → **Install app**).
3. Open it from the home screen — full-screen, like a native app. Tap **Allow** when it asks for the mic.

---

# Part B · Everyday use

- **Tasks:** tap the pixel mic and speak ("add buy milk and call mom tomorrow", "I finished the report"), or type. Tasks stay until you complete them.
- **Daily brief:** open the app in the morning — it asks if you want the brief, then reads ~12 stories aloud across AI, tech, marketing, content and geopolitics. Or open the **Brief** tab any time and tap ▶.
- **Insights:** streak, completion rate, and week/month/year charts.

---

# Part C · Add features & ship an update

This is the loop that gets **new features onto your installed phone app**:

```
edit the app  →  commit & push to the branch  →  GitHub rebuilds the live site
             →  within ~1 min your phone app shows "New version — tap to update"
             →  tap Update  →  it refreshes into the new feature
```

You don't reinstall anything — the installed app updates itself in place.

**How to add a feature:** just ask me (Claude) — e.g. *"add tags to tasks"*,
*"let me pick which brief topics I care about"*, *"add a dark mode"*. I make the
change on the branch and push; the steps above do the rest.

**A few specifics:**
- **App/design/feature changes** (most things): push → the update banner appears. Nothing else to do.
- **New database fields** (e.g. task tags): I'll give you a short SQL snippet to run in the Supabase **SQL Editor** (like Part A2).
- **Voice/brief logic changes:** re-run `supabase functions deploy voice-intent` (or `daily-brief`). I'll tell you when that's needed.
- **Secrets/keys** are set once (Part A6/A7) and reused.

> If you ever don't see the update, fully close the app and reopen it — it checks for a new version on launch.

---

## Running on your computer (optional)
```bash
npm install
cp .env.example .env      # paste your Supabase URL + anon key
npm run dev               # open the printed http://localhost:5173 link
```

## Troubleshooting
- **"Almost there" screen** → the GitHub secrets (A7.1) are missing/misspelled. Fix and re-run the workflow.
- **Voice does nothing** → check A6 finished (`voice-intent` deployed, key set) and you tapped **Allow** for the mic.
- **Brief won't load** → check `daily-brief` is deployed + the Anthropic key is set; open the Brief tab → **Try again**.
- **Costs** → set a spend limit in the Anthropic console. Personal use is typically a few cents a day.
