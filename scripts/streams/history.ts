// Broadcast history kept in the repo (stream-data branch), because Twitch deletes VODs after a while.
// Pure functions so the merge rules are easy to test.

import { usualBucket, type StreamsResponse } from '../../shared/streams'
import { parseTwitchDuration, type HelixStream, type HelixVideo } from './twitch'

export interface Broadcast {
  streamId: string
  videoId: string | null
  title: string
  /** ISO 8601 UTC */
  startedAt: string
  /** seconds */
  duration: number
  /** VOD url, null once the VOD is gone */
  url: string | null
  lastSeenAt: string
}

/** Record VODs. The VOD's duration is authoritative; title follows any edits she makes. */
export function mergeArchives(history: Broadcast[], videos: HelixVideo[], now: string): Broadcast[] {
  const byId = new Map(history.map((b) => [b.streamId, { ...b }]))
  for (const v of videos) {
    const streamId = v.stream_id || `video:${v.id}`
    const prev = byId.get(streamId)
    byId.set(streamId, {
      streamId,
      videoId: v.id,
      title: v.title,
      startedAt: prev?.startedAt ?? v.created_at,
      duration: Math.max(prev?.duration ?? 0, parseTwitchDuration(v.duration)),
      url: v.url,
      lastSeenAt: now,
    })
  }
  return sortHistory([...byId.values()])
}

/**
 * Forget VOD links Twitch no longer returns. With fewer than 100 results we saw every VOD,
 * so anything missing is gone; with a full page we can only judge rows inside its date range.
 */
export function markDeletedVods(history: Broadcast[], videos: HelixVideo[]): Broadcast[] {
  const live = new Set(videos.map((v) => v.id))
  const complete = videos.length < 100
  const oldest = videos.at(-1)?.created_at ?? ''
  return history.map((b) =>
    b.videoId && !live.has(b.videoId) && (complete || b.startedAt >= oldest) ? { ...b, videoId: null, url: null } : b,
  )
}

/** Log the live stream too, so broadcasts with VODs disabled still make the history. */
export function recordLive(history: Broadcast[], s: HelixStream, now: string): Broadcast[] {
  const elapsed = Math.max(0, Math.round((Date.parse(now) - Date.parse(s.started_at)) / 1000))
  const prev = history.find((b) => b.streamId === s.id)
  const entry: Broadcast = {
    streamId: s.id,
    videoId: prev?.videoId ?? null,
    title: s.title,
    startedAt: s.started_at,
    duration: Math.max(prev?.duration ?? 0, elapsed),
    url: prev?.url ?? null,
    lastSeenAt: now,
  }
  return sortHistory([...history.filter((b) => b.streamId !== s.id), entry])
}

function sortHistory(history: Broadcast[]): Broadcast[] {
  return history.sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0))
}

export function buildResponse(
  history: Broadcast[],
  live: HelixStream | null,
  login: string,
  updatedAt: string,
): StreamsResponse {
  const videosUrl = `https://twitch.tv/${login}/videos`
  const startTimes = history.slice(0, 60).map((b) => b.startedAt)
  return {
    live: live ? { title: live.title, startedAt: live.started_at, viewerCount: live.viewer_count } : null,
    recent: history
      .filter((b) => b.streamId !== live?.id)
      .slice(0, 4)
      .map((b) => ({ title: b.title, startedAt: b.startedAt, duration: b.duration, url: b.url ?? videosUrl })),
    usualTime: usualBucket(startTimes, (d) => d.getUTCHours()),
    startTimes,
    updatedAt,
  }
}

/** True when what visitors would see differs (ignores the refresh timestamp). */
export function responseChanged(prev: StreamsResponse | null, next: StreamsResponse): boolean {
  if (!prev) return true
  const strip = ({ updatedAt: _ignored, ...rest }: StreamsResponse) => JSON.stringify(rest)
  return strip(prev) !== strip(next)
}
