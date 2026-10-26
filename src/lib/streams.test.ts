import { describe, expect, it } from 'vitest'
import { bucketForHour, usualBucket } from '../../shared/streams'
import { formatDuration, formatShortDuration, readCached, timeAgo } from './streams'

const utcHour = (d: Date) => d.getUTCHours()

describe('bucketForHour', () => {
  it('maps edges', () => {
    expect(bucketForHour(4)).toBe('late nights')
    expect(bucketForHour(5)).toBe('mornings')
    expect(bucketForHour(12)).toBe('afternoons')
    expect(bucketForHour(17)).toBe('evenings')
    expect(bucketForHour(22)).toBe('late nights')
  })
})

describe('usualBucket', () => {
  it('returns null with no data', () => {
    expect(usualBucket([], utcHour)).toBeNull()
  })
  it('picks the most common bucket', () => {
    const starts = ['2026-10-20T13:00:00Z', '2026-10-18T19:00:00Z', '2026-10-15T14:30:00Z']
    expect(usualBucket(starts, utcHour)).toBe('afternoons')
  })
  it('breaks ties toward the most recent stream', () => {
    const starts = ['2026-10-20T19:00:00Z', '2026-10-18T13:00:00Z']
    expect(usualBucket(starts, utcHour)).toBe('evenings')
  })
  it('depends on the timezone of the hour function', () => {
    // 15:00 UTC is an afternoon in London but late night in Tokyo-ish (UTC+9 -> 00:00)
    const starts = ['2026-10-20T15:00:00Z']
    expect(usualBucket(starts, utcHour)).toBe('afternoons')
    expect(usualBucket(starts, (d) => (d.getUTCHours() + 9) % 24)).toBe('late nights')
  })
  it('ignores invalid dates', () => {
    expect(usualBucket(['nope'], utcHour)).toBeNull()
  })
})

describe('formatting', () => {
  it('formats durations', () => {
    expect(formatDuration(3 * 3600 + 18 * 60 + 10)).toBe('3:18:10')
    expect(formatDuration(59)).toBe('0:00:59')
    expect(formatShortDuration(2 * 3600 + 45 * 60 + 20)).toBe('2:45')
  })
  it('formats relative time', () => {
    const now = new Date('2026-10-26T12:00:00Z')
    expect(timeAgo('2026-10-26T11:59:30Z', now)).toBe('just now')
    expect(timeAgo('2026-10-26T09:00:00Z', now)).toBe('3 hours ago')
    expect(timeAgo('2026-10-25T11:00:00Z', now)).toBe('yesterday')
    expect(timeAgo('2026-10-24T11:00:00Z', now)).toBe('2 days ago')
  })
})

describe('readCached', () => {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  } as Storage
  const payload = (updatedAt: string) =>
    JSON.stringify({ live: { title: 'x', startedAt: updatedAt, viewerCount: 1 }, recent: [], usualTime: null, startTimes: [], updatedAt })

  it('keeps a recent live status', () => {
    store.set('duckiedoll:streams', payload('2026-10-26T11:20:00Z'))
    expect(readCached(new Date('2026-10-26T12:00:00Z'))?.live).not.toBeNull()
  })
  it('drops a stale live status but keeps history', () => {
    store.set('duckiedoll:streams', payload('2026-10-26T11:10:00Z'))
    const cached = readCached(new Date('2026-10-26T12:00:00Z'))
    expect(cached).not.toBeNull()
    expect(cached?.live).toBeNull()
  })
  it('ignores garbage', () => {
    store.set('duckiedoll:streams', '{nope')
    expect(readCached()).toBeNull()
  })
})
