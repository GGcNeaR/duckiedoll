# duckiedoll portfolio: motion spec

Reference implementation: `design/Motion.dc.html` (interactive demo; copy the
`@keyframes` and timings from its `<style>` block). Ignore its `<x-dc>`,
`<sc-if>`, `<sc-for>` markup and DCLogic script except as behavior reference.

## Global rules

- Animate **only `transform` and `opacity`** (plus `box-shadow` on buttons and
  `width` on the one-time boot bar).
- UI feedback ≤ 250ms. Nothing blocks reading or clicking content.
- **Reduced motion:** wrap everything in a single global rule:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  ```
  With reduced motion turned on, every element shows its final state instantly
  (windows visible, boot bar full, LIVE dot static).
- Put keyframes and motion tokens in `src/styles/motion.css`:
  `--ease-pop: cubic-bezier(.2,.8,.3,1.2)`, `--dur-fast: 80ms`,
  `--dur-ui: 200ms`, `--dur-enter: 280ms`.
- No animation libraries. Plain CSS plus small composables.

## 1. Window open on scroll — `v-reveal` directive

- Every `RetroWindow` (and the community cards) starts at
  `opacity: 0; transform: scale(.94) translateY(12px)` and animates to its
  resting state over 280ms with `--ease-pop` when it enters the viewport.
- `IntersectionObserver`, threshold 0.15, `rootMargin: 0px 0px -10% 0px`.
  Fire **once** per element, then unobserve.
- Siblings in the same row stagger by 80ms (pass the index:
  `v-reveal="{ delay: i * 80 }"`).
- Elements already in the viewport on first load animate immediately (hero).
- Without JS, or with reduced motion, content must be visible: add the hidden
  start state through a `.js-motion` class on `<html>`, set by script only when
  motion is allowed.

## 2. Boot bar in the hero

- The `welcome.exe` progress bar fills from 0 → 100% over 1.6s with
  `steps(16, end)` (chunky, like the old OS), starting when the hero window
  finishes opening.
- Label changes from "loading good vibes..." to "ready ✓" (fade + 4px rise,
  250ms) when the fill ends. Runs **every time the page is opened**, including
  reloads (no session flag). With reduced motion the bar renders full with
  "ready ✓" straight away.
- The bar is decorative: `aria-hidden="true"`. Don't announce it.

## 3. Stream player

- **LIVE dot:** pink pulse ring, `box-shadow` 0 → 12px fading out, 1.4s
  infinite. Use the same pulse on the nav "watch live" pill dot, only while live.
- **Equalizer:** 4 bars (6×28px, `#F4A6C8`) beside the title. While live, each
  bar runs `scaleY(.25 ↔ 1)` with different durations/delays
  (.9s, .7s/-.2s, 1.1s/-.4s, .8s/-.1s), `transform-origin: bottom`. Offline:
  bars rest at `scaleY(.12)` with a 300ms transition.
- **State swap flicker:** when the live check resolves, or the state changes, the
  "now playing" panel replays a 350ms LCD flicker
  (opacity 0 → 1 → .3 → 1 → .6 → 1). Re-trigger by changing the panel's
  `:key` to the state.
- Pause the equalizer and pulse when the tab is hidden
  (`document.visibilityState`), and when the player is off-screen.

## 4. Buttons — `AppButton`

- Hover: `translate(-2px, -2px)`, shadow grows to `6px 6px 0`.
- Active (press): `translate(4px, 4px)`, shadow to `0 0 0`, so it sinks into
  its shadow. Transition 80ms ease.
- Apply to every offset-shadow button and link-button. Keep a visible
  `:focus-visible` ring (2px dashed `#2A1F3D`, offset 3px). The motion is not
  the focus indicator.

## 5. Side quest icons — `DesktopIcon`

- Hover / focus: icon tile background → `#B9A3E3` with a 2px dashed outline,
  offset 3px (desktop selection look).
- Click: tile bounces (`scale 1 → .88 → 1.08 → 1`, 350ms). Restart the animation
  on repeat clicks by removing the class, forcing a reflow, then re-adding it.
- Click also opens a small "`<hobby>.txt`" note window under the grid, using the
  same window-open animation, with one line per hobby from `src/content.js`
  (`currentlyWatching`, `currentlyReading`, etc.). Only one note open at a time.
  The icons are real `<button>`s with `aria-expanded` and `aria-controls`.

## 6. Pixel heart burst

- Clicking the "you are truly: amazing." card spawns 7 pixel hearts (SVG from
  the design file), random horizontal position 15–85%, sizes 14–30px, colors
  cycle `#F4A6C8 #C2477F #B9A3E3 #8B6CC9`, random delay 0–250ms.
- Each heart floats up 150px while scaling .6 → 1.1 and fading out, over 1.1s.
  Remove the hearts from the DOM after 1.5s.
- Hearts are `aria-hidden`, `pointer-events: none`, clipped by the card area.
  Cap at 30 hearts on screen at once (fast clicking).
- Make the card a `<button>`. Optional easter egg, not essential UX.

## 7. Mobile menu

- Menu icon is 3 bars that morph into an X: the top bar
  `translateY(7px) rotate(45deg)`, the middle bar fades out, the bottom bar
  `translateY(-7px) rotate(-45deg)`, 200ms.
- Dropdown items slide in (`translateY(-8px) → 0` + fade, 220ms), staggered
  30ms per item (`watch live` last).
- Closing: no stagger, fade the whole panel out in 150ms.

## Not doing (decided against)

Cursor trail, draggable windows.

## Done when

- Every animation above matches the demo's feel at 1440px and 390px.
- Reduced motion on: zero movement, all content visible immediately.
- No layout shift from the reveal (CLS stays ~0). Hidden start states use
  transform/opacity only.
- 60fps in Chrome DevTools performance on a mid-range phone profile
  (4× CPU throttle).
