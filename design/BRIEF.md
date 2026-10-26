# duckiedoll portfolio — build brief

Build a portfolio website for the Twitch streamer "duckiedoll" (Duckie / Paty).

Design reference (source of truth for layout, copy, colors, spacing):
- `design/Main.dc.html`: the full home page, desktop + mobile behavior
- `design/Theme.dc.html`: palette, type, and component samples

These are design-tool files, not production code. `{{accent}}` = `#6B4FA0`; ignore
`<x-dc>`, `<helmet>`, `<sc-if>` and the DCLogic script except as behavior reference.

Stack: Vue 3 (Composition API, JavaScript) + Vite + Tailwind CSS 4.
**Client-only static site, no backend.** Hosted as static files (GitHub Pages,
Cloudflare Pages or Netlify). The only server-side piece is a scheduled
GitHub Action that refreshes a JSON data file (see StreamPlayer).

## Theme: "Lavender Desktop '01"

Y2K desktop nostalgia + kawaii. Every section is a retro window: 2px `#2A1F3D`
border, 12px radius, hard offset shadow (`8px 8px 0 #2A1F3D`), title bar with
filename label and decorative window buttons.

Tokens (put them in the Tailwind theme):
- bg `#EFE7FA` with a 22px dot-grid pattern (`#D6C6F0`)
- lavender `#B9A3E3`, violet `#6B4FA0`, ink `#2A1F3D`, muted `#6E5A92`
- pink `#F4A6C8`, berry `#C2477F`, butter `#FFF6C9`, night `#121014`

Fonts (Google Fonts): Pixelify Sans (headings/UI), Nunito (body), Caveat (handwritten asides).
Icons: inline stroke SVGs, no emoji. Pixel heart + duck SVGs are in the design file.

## Components

RetroWindow (title, titleColor, slot), PixelHeart, DuckLogo, AppButton
(primary/secondary with offset shadow + hover lift), DesktopIcon, ClipCard,
CommunityCard, StreamPlayer, SiteNav.

## Page sections (single page, anchor nav)

1. Sticky nav: logo, links (about, streams, clips, side quests, community),
   "watch live" pill. At ≤640px: links and pill hide, and a 48px menu button
   toggles a full-width dropdown (links + full-width watch live button).
   aria-expanded/aria-controls set, closes on link tap and on Escape.
2. Hero: welcome.exe window (heading uses `clamp(46px, 11vw, 76px)`), avatar
   window with image slot, "you are truly: amazing." card.
3. About window (dl of facts + fun facts) beside the StreamPlayer.
4. Side quests: 6 hobby desktop icons, grid `minmax(140px, 1fr)`.
5. Favorite moments: 3 clip cards, grid `minmax(min(320px,100%),1fr)`.
6. Community (dark): Discord, TikTok, Wishlist (throne.com/duckiedoll), Support.
7. Footer.

Keep all bracketed placeholders (`[CLIP TITLE]` etc.) as config in one
`src/content.js` file so she can fill them in later.

## StreamPlayer: live data, no fixed schedule

Twitch's API needs a client secret, which must never ship in browser code, so
the data is split in two:

**1. Past broadcasts: static JSON refreshed by a GitHub Action**
- `scripts/fetch-streams.mjs` (Node, no deps beyond fetch) gets an app token
  (client credentials), then calls `/helix/users?login=duckiedoll` and
  `/helix/videos?user_id=…&type=archive&first=20`.
- It merges results into `public/data/streams.json`, keyed by video id, and
  **never deletes old entries**, so the history survives Twitch VOD expiry.
  Shape: `{ updatedAt, streams: [{id, title, startedAt, duration, url}] }`
  sorted newest first.
- `.github/workflows/streams.yml`: cron every 30 min + manual dispatch. Runs the
  script with `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` from repo secrets,
  commits the JSON only if it changed, then the normal deploy workflow publishes.
- The site fetches `/data/streams.json` at runtime.

**2. Live status: in the browser**
- Load the official Twitch embed script (`https://embed.twitch.tv/embed/v1.js`)
  in a hidden or small player for channel `duckiedoll` and listen for
  `Twitch.Embed.VIDEO_PLAY` / `Twitch.Player.ONLINE` / `OFFLINE`. `parent` must
  list the production domain and `localhost`.
- When online: show the LIVE state and optionally reveal the embedded player.

UI: LIVE state with a pink dot + current title; offline shows "last on air X ago",
title, duration, "replay it →" (newest JSON entry); list of the 4 most recent
streams with ellipsized titles; "Usually live in the [afternoons]" computed on
the client from the stored start times in the visitor's timezone.
Graceful fallback when the JSON or embed fails (hide the section's dynamic parts,
keep the "watch on Twitch" link).

## Done when

- Matches the design at 1440px and 390px; no horizontal scroll at 360px.
- Keyboard and screen-reader friendly (real buttons/links, 4.5:1 text contrast).
- Lighthouse a11y ≥ 95; `npm run build` outputs a fully static `dist/`.
- README explains the repo secrets, the data workflow, and static hosting deploy.
- No secrets anywhere in `src/` or the built bundle.

Start by scaffolding the project and the design tokens, then build the
components, then the page, then the streams data script + workflow and the live
embed. Show the plan before writing code.

## Motion

Implement the animations in `design/MOTION.md` (demo: `design/Motion.dc.html`)
after the static page works. Build the motion as one layer on top of the page
(`motion.css`, a `v-reveal` directive, small composables) so it can be switched
off globally.
