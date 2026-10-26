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

Backend service, endpoint `GET /api/streams` returns:

```
{ live: {title, startedAt, viewerCount} | null,
  recent: [{title, startedAt, duration, url}],   // last 4
  usualTime: "afternoons" | "evenings" | ... }
```

- Twitch Helix with an app access token (client credentials). Use
  `/helix/users?login=duckiedoll` for the id, `/helix/streams` for live status,
  `/helix/videos?type=archive` for past broadcasts.
- Cache responses ~3 min. Persist every broadcast seen (SQLite is fine), because
  Twitch deletes VODs after a while.
- usualTime = most common start-time bucket over stored streams, in the
  visitor's timezone on the client.
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` from env, never shipped to the client.

UI: LIVE state with a pink dot + title; offline shows "last on air X ago",
title, duration, "replay it →"; list of recent streams with ellipsized titles.
Graceful fallback when the API fails.

## Done when

- Matches the design at 1440px and 390px; no horizontal scroll at 360px.
- Keyboard and screen-reader friendly (real buttons/links, 4.5:1 text contrast).
- Lighthouse a11y ≥ 95; README explains env vars and Render deploy.

Start by scaffolding the project and the design tokens, then build the
components, then the page, then the Twitch service. Show the plan before
writing code.
