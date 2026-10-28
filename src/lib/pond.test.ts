import { describe, expect, it } from 'vitest'
import {
  CRUMB_LIFETIME,
  MAX_CRUMBS,
  boundsFor,
  bubbleBelow,
  bubbleShift,
  makeDucks,
  nearestDuck,
  pickDucks,
  pickLine,
  scatter,
  shade,
  step,
  throwBread,
  type Crumb,
  type SimDuck,
} from './pond'

/** deterministic rng */
function seeded(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const pond = boundsFor({ w: 800, h: 360 })
const duck = (id: number, x: number, y: number, extra: Partial<SimDuck> = {}): SimDuck => ({
  id, x, y, vx: 0, vy: 0, tx: x, ty: y, facing: 1, held: false, ...extra,
})

describe('pickDucks', () => {
  it('returns up to max distinct items', () => {
    const all = Array.from({ length: 20 }, (_, i) => i)
    const picked = pickDucks(all, 12, seeded())
    expect(picked).toHaveLength(12)
    expect(new Set(picked).size).toBe(12)
    expect(pickDucks([1, 2], 12)).toHaveLength(2)
  })
})

describe('pickLine', () => {
  const generic = ['quack!', 'hi chat']
  it('uses personal lines most of the time, generic otherwise', () => {
    expect(pickLine(['mine'], generic, () => 0.1)).toBe('mine')
    expect(generic).toContain(pickLine(['mine'], generic, () => 0.9))
  })
  it('falls back to generic lines, or a plain quack', () => {
    expect(generic).toContain(pickLine(undefined, generic, () => 0.1))
    expect(pickLine([], [], Math.random)).toBe('quack!')
    expect(pickLine(['only'], [], () => 0.9)).toBe('only')
  })
  it('does not say the same line twice in a row', () => {
    for (let i = 0; i < 20; i++) expect(pickLine(undefined, generic, Math.random, 'quack!')).toBe('hi chat')
  })
})

describe('scatter / makeDucks', () => {
  it('places every duck inside the bounds without stacking', () => {
    const pts = scatter(12, pond, seeded(3))
    expect(pts).toHaveLength(12)
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(pond.minX)
      expect(p.x).toBeLessThanOrEqual(pond.maxX)
      expect(p.y).toBeGreaterThanOrEqual(pond.minY)
      expect(p.y).toBeLessThanOrEqual(pond.maxY)
    }
    const minGap = Math.min(...pts.flatMap((a, i) => pts.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y))))
    expect(minGap).toBeGreaterThan(20)
    expect(makeDucks(7, pond).map((d) => d.id)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('step', () => {
  it('keeps wandering ducks inside the pond', () => {
    const rng = seeded(7)
    const ducks = makeDucks(12, pond, rng)
    for (let i = 0; i < 3000; i++) step(ducks, [], pond, 1 / 60, rng)
    for (const d of ducks) {
      expect(d.x).toBeGreaterThanOrEqual(pond.minX)
      expect(d.x).toBeLessThanOrEqual(pond.maxX)
      expect(d.y).toBeGreaterThanOrEqual(pond.minY)
      expect(d.y).toBeLessThanOrEqual(pond.maxY)
    }
  })

  it('turns ducks to face where they swim', () => {
    const d = duck(0, 300, 200, { tx: 100, ty: 200 })
    for (let i = 0; i < 30; i++) step([d], [], pond, 1 / 60)
    expect(d.facing).toBe(-1)
  })

  it('keeps ducks from piling on top of each other', () => {
    const a = duck(0, 400, 200)
    const b = duck(1, 405, 202)
    for (let i = 0; i < 180; i++) step([a, b], [], pond, 1 / 60, () => 0.5)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(30)
  })

  it('stops a held duck', () => {
    const d = duck(0, 300, 200, { vx: 40, tx: 600, held: true })
    for (let i = 0; i < 60; i++) step([d], [], pond, 1 / 60)
    expect(Math.abs(d.vx)).toBeLessThan(0.5)
  })

  it('sends the nearest ducks racing for bread, and one eats it', () => {
    const near = duck(0, 300, 200)
    const far = duck(1, 700, 300)
    const crumbs: Crumb[] = [{ id: 1, x: 360, y: 200, age: 0 }]
    const eaten = []
    for (let i = 0; i < 600 && crumbs.length; i++) eaten.push(...step([near, far], crumbs, pond, 1 / 60).eaten)
    expect(eaten).toEqual([{ duckId: 0, crumbId: 1 }])
    expect(crumbs).toHaveLength(0)
  })

  it('sinks crumbs nobody eats', () => {
    const crumbs: Crumb[] = [{ id: 1, x: 400, y: 200, age: CRUMB_LIFETIME - 0.01 }]
    const r = step([duck(0, 40, 40, { held: true })], crumbs, pond, 0.02)
    expect(r.sunk).toEqual([1])
    expect(crumbs).toHaveLength(0)
  })
})

describe('throwBread', () => {
  it('drops crumbs inside the pond and caps how many float', () => {
    const crumbs: Crumb[] = []
    let id = 0
    for (let i = 0; i < 4; i++) id += throwBread(crumbs, { x: 5, y: 999 }, pond, id).length
    expect(crumbs).toHaveLength(MAX_CRUMBS)
    expect(crumbs[0].id).toBe(12 - MAX_CRUMBS)
    for (const c of crumbs) {
      expect(c.x).toBeGreaterThanOrEqual(pond.minX)
      expect(c.y).toBeLessThanOrEqual(pond.maxY)
    }
  })
})

describe('nearestDuck', () => {
  it('finds the closest duck', () => {
    expect(nearestDuck([duck(0, 0, 0), duck(1, 100, 100)], 90, 90)).toBe(1)
    expect(nearestDuck([], 0, 0)).toBeUndefined()
  })
})

describe('speech bubbles', () => {
  it('shift sideways to stay inside the pond', () => {
    expect(bubbleShift(400, 160, 800)).toBe(0)
    expect(bubbleShift(30, 160, 800)).toBe(58) // left edge lands on 8px
    expect(bubbleShift(790, 160, 800)).toBe(-78) // right edge lands on 792px
    expect(bubbleShift(100, 400, 300)).toBe(50) // wider than the pond: centre it
  })
  it('flip below the duck near the top', () => {
    expect(bubbleBelow(50, 40)).toBe(true)
    expect(bubbleBelow(200, 40)).toBe(false)
  })
})

describe('shade', () => {
  it('darkens a hex colour and leaves other values alone', () => {
    expect(shade('#ffffff', 0.5)).toBe('#808080')
    expect(shade('red')).toBe('red')
  })
})
