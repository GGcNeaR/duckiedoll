import { describe, expect, it } from 'vitest'
import { HEART_COLORS, MAX_HEARTS, addHearts, makeHearts } from './hearts'

describe('makeHearts', () => {
  it('makes 7 hearts within the spec ranges', () => {
    for (const rng of [() => 0, () => 0.999, Math.random]) {
      const hearts = makeHearts(10, rng)
      expect(hearts).toHaveLength(7)
      expect(hearts.map((h) => h.id)).toEqual([10, 11, 12, 13, 14, 15, 16])
      for (const h of hearts) {
        expect(h.left).toBeGreaterThanOrEqual(15)
        expect(h.left).toBeLessThanOrEqual(85)
        expect(h.size).toBeGreaterThanOrEqual(14)
        expect(h.size).toBeLessThanOrEqual(30)
        expect(h.delay).toBeGreaterThanOrEqual(0)
        expect(h.delay).toBeLessThanOrEqual(250)
      }
    }
  })
  it('cycles the four colors', () => {
    expect(makeHearts(0).map((h) => h.color)).toEqual([...HEART_COLORS, ...HEART_COLORS.slice(0, 3)])
  })
  it('caps hearts on screen, dropping the oldest', () => {
    let hearts = makeHearts(0)
    for (let i = 1; i < 10; i++) hearts = addHearts(hearts, makeHearts(i * 7))
    expect(hearts).toHaveLength(MAX_HEARTS)
    expect(hearts.at(-1)!.id).toBe(69)
    expect(hearts[0].id).toBe(70 - MAX_HEARTS)
  })
})

