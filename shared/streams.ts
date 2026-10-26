// Shape of streams.json, shared by the site and scripts/streams/refresh.ts.

export type TimeBucket = 'mornings' | 'afternoons' | 'evenings' | 'late nights'

export interface LiveStream {
  title: string
  /** ISO 8601 */
  startedAt: string
  viewerCount: number
}

export interface RecentStream {
  title: string
  /** ISO 8601 */
  startedAt: string
  /** seconds */
  duration: number
  /** VOD link, or the channel's videos page when the VOD is gone */
  url: string
}

export interface ClipInfo {
  title: string
  /** clip page on Twitch */
  url: string
  thumbnailUrl: string
  viewCount: number
  /** ISO 8601 */
  createdAt: string
}

export interface StreamsResponse {
  live: LiveStream | null
  /** last 4 finished broadcasts, newest first */
  recent: RecentStream[]
  /** most common start bucket in UTC; clients should prefer bucketing startTimes locally */
  usualTime: TimeBucket | null
  /** ISO starts of stored broadcasts (newest first), for local-timezone bucketing */
  startTimes: string[]
  /** newest clips (up to 3), used when none are set in src/content.ts; absent in older payloads */
  clips?: ClipInfo[]
  /** ISO time the data was refreshed from Twitch */
  updatedAt: string
}

export function bucketForHour(hour: number): TimeBucket {
  if (hour >= 5 && hour < 12) return 'mornings'
  if (hour >= 12 && hour < 17) return 'afternoons'
  if (hour >= 17 && hour < 22) return 'evenings'
  return 'late nights'
}

/** Most common bucket; ties go to the bucket of the most recent stream among the tied ones. */
export function usualBucket(startTimes: string[], hourOf: (d: Date) => number): TimeBucket | null {
  const counts = new Map<TimeBucket, number>()
  const firstSeen = new Map<TimeBucket, number>()
  startTimes.forEach((iso, i) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return
    const b = bucketForHour(hourOf(d))
    counts.set(b, (counts.get(b) ?? 0) + 1)
    if (!firstSeen.has(b)) firstSeen.set(b, i)
  })
  let best: TimeBucket | null = null
  for (const [b, n] of counts) {
    if (best === null) { best = b; continue }
    const bn = counts.get(best)!
    if (n > bn || (n === bn && firstSeen.get(b)! < firstSeen.get(best)!)) best = b
  }
  return best
}
