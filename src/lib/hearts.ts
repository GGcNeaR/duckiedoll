// Pixel-heart burst for the "you are truly: amazing." card.

export const HEART_COLORS = ['#F4A6C8', '#C2477F', '#B9A3E3', '#8B6CC9'] as const
export const HEARTS_PER_BURST = 7
export const MAX_HEARTS = 30
/** how long a heart lives before it's removed (its animation is 1.1s + up to .25s delay) */
export const HEART_LIFETIME_MS = 1500

export interface Heart {
  id: number
  /** % from the left of the burst area */
  left: number
  /** px */
  size: number
  color: string
  /** ms */
  delay: number
}

export function makeHearts(startId: number, rng: () => number = Math.random, count = HEARTS_PER_BURST): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    left: Math.round(15 + rng() * 70),
    size: 14 + Math.round(rng() * 16),
    color: HEART_COLORS[i % HEART_COLORS.length],
    delay: Math.round(rng() * 250),
  }))
}

/** Add a burst, dropping the oldest hearts beyond the on-screen cap. */
export function addHearts(current: Heart[], burst: Heart[], cap = MAX_HEARTS): Heart[] {
  return [...current, ...burst].slice(-cap)
}
