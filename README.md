# duckiedoll — portfolio site

Single-page site for Twitch streamer **duckiedoll** (Duckie / Paty), built from the
"Lavender Desktop '01" design in `design/`.

Everything runs on GitHub, for free:

- **Site**: Vue 3 + Vite + Tailwind CSS 4 + TypeScript, static files on **GitHub Pages**.
- **Stream data**: a scheduled **GitHub Action** fetches from Twitch every ~10 minutes, saves
  every broadcast to a `stream-data` branch, and redeploys the site with a fresh `streams.json`
  when something changed. There's no server to host.

> The repository must be **public**. That's what makes Pages and Actions minutes free.
> (A private repo would burn through the free Actions minutes within days.)

```
src/content.ts          ← all text, links and [PLACEHOLDERS] — edit this one
src/components/         RetroWindow, AppButton, StreamPlayer, SiteNav, …
src/sections/           page sections
src/lib/streams.ts      loads streams.json + time formatting / "usually live" bucketing
shared/streams.ts       streams.json type, shared by the site and the refresh script
scripts/streams/        Twitch refresh script (run by the Action)
.github/workflows/site.yml   build, deploy and the 10-minute schedule
```

## Filling in content

Open `src/content.ts`. Anything still in `[BRACKETS]` or with a `[TODO]` comment needs real content:

- **Avatar**: drop a transparent PNG in `public/` (e.g. `public/avatar.png`) and set `avatar.src = 'avatar.png'`.
- **Clips**: leave them as they are to show her **3 newest Twitch clips automatically**. To hand-pick
  instead, set `title`, `views`, `date`, `href` (Twitch clip URL) and optionally `thumbnail` (image in
  `public/` or a URL). As soon as any clip has an `href`, only the hand-picked ones are shown.
- **Community links**: Discord, TikTok and Support are `#` until you paste the real links.

Commit and push to `main`, and the site redeploys in about a minute.

## Setup (one time)

### 1. Twitch app

1. Go to <https://dev.twitch.tv/console/apps>, choose **Register Your Application**, and pick category "Website Integration".
   The OAuth redirect URL can be `http://localhost` because it isn't used.
2. Copy the **Client ID** and generate a **Client Secret**.

### 2. GitHub

1. Push this folder to a **public** GitHub repository, on the `main` branch.
2. **Settings → Secrets and variables → Actions → Secrets**: add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. If the site will use a custom domain or the repo is named `<user>.github.io`:
   **Settings → Secrets and variables → Actions → Variables**, add `VITE_BASE` = `/`.
5. **Actions → Site → Run workflow** (or push to `main`). The first run creates the
   `stream-data` branch and deploys the site.

## Environment variables

| Name | Where | What |
| --- | --- | --- |
| `TWITCH_CLIENT_ID` | Actions **secret** / local `.env` | Twitch app client id |
| `TWITCH_CLIENT_SECRET` | Actions **secret** / local `.env` | Twitch app client secret, used only inside the Action and never shipped to the site |
| `TWITCH_LOGIN` | `site.yml` `env` / local `.env` | Channel login, `duckiedoll` |
| `VITE_BASE` | Actions **variable** (optional) | Site base path. Defaults to `/<repo-name>/`; set to `/` for a custom domain or a `<user>.github.io` repo |
| `VITE_STREAMS_API_URL` | optional | Override where the site loads stream data from (default: the deployed `streams.json`) |

## Local development

Requires Node 22+.

```sh
npm install
npm run dev              # http://localhost:5173
```

Without stream data the player shows its friendly offline fallback. To load real data locally:

```sh
cp .env.example .env     # fill in the Twitch credentials
npm run streams:refresh  # writes public/streams.json (history goes to .stream-data/)
```

`npm test` runs the unit tests and `npm run build` type-checks and builds to `dist/`.

## How stream data works

- `streams.json` looks like
  `{ live: {title, startedAt, viewerCount} | null, recent: [{title, startedAt, duration, url}] (last 4), usualTime, startTimes, clips: [{title, url, thumbnailUrl, viewCount, createdAt}], updatedAt }`.
  `duration` is in seconds.
- `scripts/streams/refresh.ts` uses a Twitch **app access token** (client credentials) and calls
  `/helix/users` (id), `/helix/streams` (live status) and `/helix/videos?type=archive` (past broadcasts).
- **Clips**: the script also fetches her 3 newest clips via `/helix/clips` (looking at the last
  90 days first, then all-time). They're used whenever no clips are set in `src/content.ts`.
  View-count changes alone don't trigger a redeploy. If the clips call fails, the last good clips are kept.
- **Every broadcast seen is kept forever** in `history.json` on the `stream-data` branch, from
  VODs and from the live stream itself. Twitch deletes VODs after a while; when that happens the
  stream stays in the history and its "replay" link falls back to the channel's videos page.
  The data lives on its own branch so `main`'s history stays clean.
- The site is only redeployed when what visitors see changed (new stream, went live/offline,
  viewer count while live), not on every run.
- **"Usually live in the …"**: `startTimes` holds the last 60 stream starts, and the browser buckets
  them by the *visitor's* local hour (mornings 5–12, afternoons 12–17, evenings 17–22,
  late nights 22–5). `usualTime` is the same calculation in UTC, used as a fallback.
- **Freshness**: GitHub runs schedules every 10 minutes at best and often 10–30 minutes late, so
  "LIVE" can show up a little after she goes live. The site stops trusting a LIVE status once the
  data is 45 minutes old, so a stuck schedule never leaves her looking live for hours.
- **Fallbacks**: if Twitch fails on a scheduled run, the run fails (GitHub emails the repo owner)
  and the site keeps the last good data. If `streams.json` can't be loaded, the site shows the last
  data this browser saw, and with nothing saved it shows a "catch me on Twitch" panel.
- GitHub turns off schedules after 60 days without repository activity. Each scheduled run
  re-enables the workflow to reset that timer, so quiet months don't stop the updates.
