import { describe, expect, it } from 'vitest'
import { parseTwitchDuration, type HelixStream, type HelixVideo } from './twitch'
import { buildResponse, markDeletedVods, mergeArchives, recordLive, responseChanged } from './history'

const vod = (n: number, created_at: string, duration = '1h0m0s'): HelixVideo => ({
  id: `v${n}`,
  stream_id: `s${n}`,
  title: `stream ${n}`,
  created_at,
  url: `https://www.twitch.tv/videos/${n}`,
  duration,
})
const NOW = '2026-10-26T12:00:00Z'

describe('parseTwitchDuration', () => {
  it('parses Helix durations', () => {
    expect(parseTwitchDuration('3h18m10s')).toBe(11890)
    expect(parseTwitchDuration('45m2s')).toBe(2702)
    expect(parseTwitchDuration('12s')).toBe(12)
    expect(parseTwitchDuration('2h')).toBe(7200)
    expect(parseTwitchDuration('garbage')).toBe(0)
  })
})

describe('history', () => {
  const videos = [vod(3, '2026-10-24T13:00:00Z', '3h18m10s'), vod(2, '2026-10-22T19:00:00Z'), vod(1, '2026-10-20T14:00:00Z')]

  it('stores VODs newest first', () => {
    const h = mergeArchives([], [videos[2], videos[0], videos[1]], NOW)
    expect(h.map((b) => b.streamId)).toEqual(['s3', 's2', 's1'])
    expect(h[0].duration).toBe(11890)
  })

  it('keeps broadcasts after Twitch deletes the VOD, without the dead link', () => {
    let h = mergeArchives([], videos, NOW)
    const remaining = videos.slice(0, 1)
    h = markDeletedVods(mergeArchives(h, remaining, NOW), remaining)
    expect(h).toHaveLength(3)
    expect(h[0].url).toBe('https://www.twitch.tv/videos/3')
    expect(h[1]).toMatchObject({ streamId: 's2', url: null, videoId: null })
  })

  it('only judges deletions inside a full page of results', () => {
    const full = Array.from({ length: 100 }, (_, i) => vod(1000 - i, `2026-10-${String(26 - Math.floor(i / 10)).padStart(2, '0')}T0${i % 10}:00:00Z`))
    const old = mergeArchives([], [vod(1, '2026-01-01T00:00:00Z')], NOW)
    const h = markDeletedVods(mergeArchives(old, full, NOW), full)
    expect(h.find((b) => b.streamId === 's1')?.url).not.toBeNull()
  })

  it('logs live streams and later upgrades them with the VOD', () => {
    const live: HelixStream = { id: 's9', title: 'live now', started_at: '2026-10-26T10:00:00Z', viewer_count: 5 }
    let h = recordLive([], live, NOW)
    expect(h[0]).toMatchObject({ streamId: 's9', duration: 7200, url: null })
    h = mergeArchives(h, [{ ...vod(9, '2026-10-26T10:00:05Z', '2h30m0s'), title: 'renamed' }], NOW)
    expect(h).toHaveLength(1)
    expect(h[0]).toMatchObject({ title: 'renamed', duration: 9000, startedAt: '2026-10-26T10:00:00Z', videoId: 'v9' })
  })

  it('builds the response without the live stream in recent', () => {
    const live: HelixStream = { id: 's9', title: 'live now', started_at: '2026-10-26T10:00:00Z', viewer_count: 5 }
    let h = mergeArchives([], videos, NOW)
    h = recordLive(markDeletedVods(h, videos.slice(0, 2)), live, NOW)
    const r = buildResponse(h, live, 'duckiedoll', NOW)
    expect(r.live).toEqual({ title: 'live now', startedAt: live.started_at, viewerCount: 5 })
    expect(r.recent.map((x) => x.title)).toEqual(['stream 3', 'stream 2', 'stream 1'])
    expect(r.recent[2].url).toBe('https://twitch.tv/duckiedoll/videos')
    expect(r.startTimes[0]).toBe(live.started_at)
    expect(r.usualTime).toBe('afternoons')
  })

  it('detects visible changes only', () => {
    const h = mergeArchives([], videos, NOW)
    const a = buildResponse(h, null, 'duckiedoll', NOW)
    expect(responseChanged(a, { ...a, updatedAt: '2026-10-26T12:10:00Z' })).toBe(false)
    expect(responseChanged(a, buildResponse(h.slice(1), null, 'duckiedoll', NOW))).toBe(true)
    expect(responseChanged(null, a)).toBe(true)
  })
})
