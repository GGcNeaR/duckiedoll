import { usualBucket, type StreamsResponse, type TimeBucket } from '../../shared/streams'

const CACHE_KEY = 'duckiedoll:streams'

/** Bucket the stored start times in the visitor's own timezone. */
export function localUsualTime(data: Pick<StreamsResponse, 'startTimes' | 'usualTime'>): TimeBucket | null {
  return usualBucket(data.startTimes ?? [], (d) => d.getHours()) ?? data.usualTime
}

/** 11590 -> "3:13:10" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** 11590 -> "3:13" (hours:minutes, for the compact list) */
export function formatShortDuration(seconds: number): string {
  const m = Math.max(0, Math.round(seconds / 60))
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86400],
  ['month', 30 * 86400],
  ['week', 7 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

/** "2 days ago", "yesterday", "just now" */
export function timeAgo(iso: string, now: Date = new Date(), locale = 'en'): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000
  if (!Number.isFinite(diff) || diff < 60) return 'just now'
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (diff >= size) return rtf.format(-Math.floor(diff / size), unit)
  }
  return 'just now'
}

export function weekday(iso: string, locale = 'en'): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(iso)).toUpperCase()
}

function isStreamsResponse(x: unknown): x is StreamsResponse {
  const o = x as StreamsResponse
  return !!o && typeof o === 'object' && Array.isArray(o.recent) && 'live' in o
}

/**
 * The data is refreshed by a scheduled GitHub Action that can run late, so a "live" status is
 * trusted for 45 minutes after the last refresh. After that she's shown as offline.
 */
export const LIVE_TRUST_MS = 45 * 60 * 1000

export function withTrustedLive(data: StreamsResponse, now: Date = new Date()): StreamsResponse {
  const age = now.getTime() - new Date(data.updatedAt).getTime()
  return data.live && !(age < LIVE_TRUST_MS) ? { ...data, live: null } : data
}

/** Last payload this browser saw. */
export function readCached(now: Date = new Date()): StreamsResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return isStreamsResponse(parsed) ? withTrustedLive(parsed, now) : null
  } catch {
    return null
  }
}

function writeCached(data: StreamsResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable: fine, it's only a fallback */
  }
}

export async function fetchStreams(url: string, timeoutMs = 8000): Promise<StreamsResponse> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    // no-cache: revalidate with the server so a fresh deploy shows up right away
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-cache', headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`streams API ${res.status}`)
    const data: unknown = await res.json()
    if (!isStreamsResponse(data)) throw new Error('streams API returned an unexpected shape')
    writeCached(data)
    return withTrustedLive(data)
  } finally {
    clearTimeout(timer)
  }
}
