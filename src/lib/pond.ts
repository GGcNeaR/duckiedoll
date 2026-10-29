// The pond: ducks that wander, chase bread and say things. Pure logic only (no DOM),
// so it can be unit tested; src/composables/usePond.ts runs it every frame.

export const MAX_DUCKS_WIDE = 8
export const MAX_DUCKS_NARROW = 6
export const PERSONAL_LINE_CHANCE = 0.6
export const MAX_CRUMBS = 6
export const CRUMBS_PER_THROW = 3
/** s: crumbs sink after this long if nobody eats them */
export const CRUMB_LIFETIME = 8
/** px from a crumb's centre that counts as eating it */
export const EAT_RADIUS = 14
/** how many of the nearest ducks race for each crumb */
export const CHASERS_PER_CRUMB = 3

const WANDER_SPEED = 16 // px/s
const CHASE_SPEED = 70
const STEER = 2.5 // how quickly velocity turns toward the desired one (1/s)
const ARRIVE = 8 // px: close enough to a wander target to pick a new one
// personal space: ducks closer than this (an ellipse, wider than tall because of the
// name labels) gently push apart
const SPACE_X = 70
const SPACE_Y = 46
const SPACE_PUSH = 45 // px/s at full overlap

export interface Size {
  w: number
  h: number
}

/** Where duck centres may go: the pond minus a margin for the sprite, name and bubbles. */
export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface SimDuck {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  tx: number
  ty: number
  /** 1 = facing right (the sprite's default), -1 = left */
  facing: 1 | -1
  /** hovered or focused: stops so it's easy to click */
  held: boolean
}

export interface Crumb {
  id: number
  x: number
  y: number
  /** s */
  age: number
}

export type Rng = () => number

export function boundsFor(pond: Size, margin = { x: 34, top: 40, bottom: 34 }): Bounds {
  return {
    minX: margin.x,
    maxX: Math.max(margin.x, pond.w - margin.x),
    minY: margin.top,
    maxY: Math.max(margin.top, pond.h - margin.bottom),
  }
}

/** A random selection of up to `max` items, in random order. */
export function pickDucks<T>(all: readonly T[], max: number, rng: Rng = Math.random): T[] {
  const copy = [...all]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, max)
}

/** One of the duck's own lines (most of the time) or a generic quack, avoiding a repeat. */
export function pickLine(
  personal: readonly string[] | undefined,
  generic: readonly string[],
  rng: Rng = Math.random,
  previous?: string,
): string {
  const usePersonal = personal?.length && (!generic.length || rng() < PERSONAL_LINE_CHANCE)
  const pool = (usePersonal ? personal : generic) as readonly string[]
  if (!pool.length) return 'quack!'
  const options = pool.length > 1 ? pool.filter((l) => l !== previous) : pool
  return options[Math.floor(rng() * options.length)]
}

/** Spread `count` points over the bounds on a jittered grid, so ducks don't start stacked. */
export function scatter(count: number, b: Bounds, rng: Rng = Math.random): { x: number; y: number }[] {
  if (count <= 0) return []
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  const cols = Math.max(1, Math.round(Math.sqrt((count * (w + 1)) / (h + 1))))
  const rows = Math.ceil(count / cols)
  const cw = w / cols
  const ch = h / rows
  const cells = pickDucks(
    Array.from({ length: cols * rows }, (_, i) => i),
    count,
    rng,
  )
  return cells.map((cell) => ({
    x: b.minX + ((cell % cols) + 0.25 + rng() * 0.5) * cw,
    y: b.minY + (Math.floor(cell / cols) + 0.25 + rng() * 0.5) * ch,
  }))
}

export function makeDucks(count: number, b: Bounds, rng: Rng = Math.random): SimDuck[] {
  return scatter(count, b, rng).map((p, id) => ({
    id,
    ...p,
    vx: 0,
    vy: 0,
    tx: p.x,
    ty: p.y,
    facing: rng() < 0.5 ? -1 : 1,
    held: false,
  }))
}

export function randomPoint(b: Bounds, rng: Rng = Math.random) {
  return { x: b.minX + rng() * (b.maxX - b.minX), y: b.minY + rng() * (b.maxY - b.minY) }
}

export function clampToBounds(d: SimDuck, b: Bounds) {
  d.x = Math.min(b.maxX, Math.max(b.minX, d.x))
  d.y = Math.min(b.maxY, Math.max(b.minY, d.y))
  d.tx = Math.min(b.maxX, Math.max(b.minX, d.tx))
  d.ty = Math.min(b.maxY, Math.max(b.minY, d.ty))
}

const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2

/** The id of the duck nearest to a point (held ducks included), or undefined if none. */
export function nearestDuck(ducks: readonly SimDuck[], x: number, y: number): number | undefined {
  let best: SimDuck | undefined
  for (const d of ducks) if (!best || dist2(d.x, d.y, x, y) < dist2(best.x, best.y, x, y)) best = d
  return best?.id
}

/** For each free duck, the crumb it's racing to: each crumb draws its few nearest ducks. */
export function assignChasers(
  ducks: readonly SimDuck[],
  crumbs: readonly Crumb[],
  perCrumb = CHASERS_PER_CRUMB,
): Map<number, Crumb> {
  const chase = new Map<number, Crumb>()
  const free = ducks.filter((d) => !d.held)
  for (const c of crumbs) {
    const nearest = [...free].sort((a, b) => dist2(a.x, a.y, c.x, c.y) - dist2(b.x, b.y, c.x, c.y)).slice(0, perCrumb)
    for (const d of nearest) {
      const current = chase.get(d.id)
      if (!current || dist2(d.x, d.y, c.x, c.y) < dist2(d.x, d.y, current.x, current.y)) chase.set(d.id, c)
    }
  }
  return chase
}

export interface StepResult {
  /** crumbs eaten this step, with who ate them */
  eaten: { duckId: number; crumbId: number }[]
  /** crumbs that sank */
  sunk: number[]
}

/**
 * Advance the pond by `dt` seconds. Mutates ducks and crumbs in place (it runs every frame)
 * and removes eaten and sunk crumbs from the array.
 */
export function step(ducks: SimDuck[], crumbs: Crumb[], b: Bounds, dt: number, rng: Rng = Math.random): StepResult {
  const result: StepResult = { eaten: [], sunk: [] }

  for (let i = crumbs.length - 1; i >= 0; i--) {
    crumbs[i].age += dt
    if (crumbs[i].age >= CRUMB_LIFETIME) result.sunk.push(crumbs.splice(i, 1)[0].id)
  }

  const chase = assignChasers(ducks, crumbs)
  const k = Math.min(1, STEER * dt)

  for (const d of ducks) {
    let dvx = 0
    let dvy = 0
    if (!d.held) {
      const crumb = chase.get(d.id)
      if (crumb) {
        d.tx = crumb.x
        d.ty = crumb.y
      } else if (dist2(d.x, d.y, d.tx, d.ty) < ARRIVE ** 2) {
        const p = randomPoint(b, rng)
        d.tx = p.x
        d.ty = p.y
      }
      const dx = d.tx - d.x
      const dy = d.ty - d.y
      const len = Math.hypot(dx, dy) || 1
      const speed = (crumb ? CHASE_SPEED : WANDER_SPEED) * Math.min(1, len / 30)
      dvx = (dx / len) * speed
      dvy = (dy / len) * speed
      for (const o of ducks) {
        if (o === d) continue
        const ox = d.x - o.x
        const oy = d.y - o.y
        const n = Math.sqrt((ox / SPACE_X) ** 2 + (oy / SPACE_Y) ** 2)
        if (n >= 1) continue
        const olen = Math.hypot(ox, oy)
        // exactly on top of each other: split sideways by id
        const ux = olen ? ox / olen : d.id < o.id ? -1 : 1
        const uy = olen ? oy / olen : 0
        dvx += ux * (1 - n) * SPACE_PUSH
        dvy += uy * (1 - n) * SPACE_PUSH
      }
    }
    d.vx += (dvx - d.vx) * (d.held ? Math.min(1, dt * 12) : k)
    d.vy += (dvy - d.vy) * (d.held ? Math.min(1, dt * 12) : k)
    d.x += d.vx * dt
    d.y += d.vy * dt

    // bounce off the banks and head somewhere else
    if (d.x < b.minX || d.x > b.maxX) {
      d.vx = -d.vx
      d.tx = b.minX + rng() * (b.maxX - b.minX)
    }
    if (d.y < b.minY || d.y > b.maxY) {
      d.vy = -d.vy
      d.ty = b.minY + rng() * (b.maxY - b.minY)
    }
    clampToBounds(d, b)

    // only turn round on clear sideways movement, so ducks don't flicker
    if (d.vx > 3) d.facing = 1
    else if (d.vx < -3) d.facing = -1
  }

  for (let i = crumbs.length - 1; i >= 0; i--) {
    const c = crumbs[i]
    const eater = ducks.find((d) => dist2(d.x, d.y, c.x, c.y) <= EAT_RADIUS ** 2)
    if (eater) {
      result.eaten.push({ duckId: eater.id, crumbId: c.id })
      crumbs.splice(i, 1)
    }
  }
  return result
}

/** A few crumbs scattered around a point, dropping the oldest beyond the cap. */
export function throwBread(
  crumbs: Crumb[],
  at: { x: number; y: number },
  b: Bounds,
  nextId: number,
  rng: Rng = Math.random,
): Crumb[] {
  const thrown = Array.from({ length: CRUMBS_PER_THROW }, (_, i) => ({
    id: nextId + i,
    x: Math.min(b.maxX, Math.max(b.minX, at.x + (rng() - 0.5) * 40)),
    y: Math.min(b.maxY, Math.max(b.minY, at.y + (rng() - 0.5) * 30)),
    age: 0,
  }))
  crumbs.push(...thrown)
  if (crumbs.length > MAX_CRUMBS) crumbs.splice(0, crumbs.length - MAX_CRUMBS)
  return thrown
}

/** Sideways shift (px) that keeps a bubble of `width`, centred over x, inside the pond. */
export function bubbleShift(x: number, width: number, pondWidth: number, pad = 8): number {
  const half = width / 2
  if (width + pad * 2 >= pondWidth) return pondWidth / 2 - x
  if (x - half < pad) return pad - (x - half)
  if (x + half > pondWidth - pad) return pondWidth - pad - (x + half)
  return 0
}

/** Whether a bubble of `height` above a duck at y would poke out of the top. */
export function bubbleBelow(y: number, height: number, duckHalfHeight = 22, pad = 6): boolean {
  return y - duckHalfHeight - height < pad
}

/** A darker shade of a #rrggbb colour, for the wing. */
export function shade(hex: string, amount = 0.18): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1], 16)
  const ch = (s: number) => Math.round(((n >> s) & 255) * (1 - amount))
  return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')
}
