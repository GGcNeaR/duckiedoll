// Minimal Twitch Helix client using an app access token (client credentials).

export interface TwitchConfig {
  clientId: string
  clientSecret: string
  login: string
  /** dev/testing only: point at a mock instead of https://api.twitch.tv and https://id.twitch.tv */
  apiBase?: string
}

export interface HelixStream {
  id: string
  title: string
  started_at: string
  viewer_count: number
}

export interface HelixVideo {
  id: string
  stream_id: string | null
  title: string
  created_at: string
  url: string
  duration: string
}

export interface HelixClip {
  id: string
  url: string
  title: string
  view_count: number
  created_at: string
  thumbnail_url: string
}

/** "3h18m10s" / "45m2s" / "12s" -> seconds */
export function parseTwitchDuration(s: string): number {
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(s.trim())
  if (!m) return 0
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
}

export function createTwitchClient(cfg: TwitchConfig) {
  let token: string | null = null

  async function appToken(): Promise<string> {
    if (token) return token
    const res = await fetch(`${cfg.apiBase ?? 'https://id.twitch.tv'}/oauth2/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'client_credentials',
      }),
    })
    if (!res.ok) throw new Error(`twitch token ${res.status}`)
    token = ((await res.json()) as { access_token: string }).access_token
    return token
  }

  async function helix<T>(path: string): Promise<T[]> {
    const res = await fetch(`${cfg.apiBase ?? 'https://api.twitch.tv'}/helix${path}`, {
      headers: { 'Client-Id': cfg.clientId, Authorization: `Bearer ${await appToken()}` },
    })
    if (!res.ok) throw new Error(`helix ${path.split('?')[0]} ${res.status}`)
    return ((await res.json()) as { data: T[] }).data
  }

  return {
    async getUserId(): Promise<string> {
      const [user] = await helix<{ id: string }>(`/users?login=${encodeURIComponent(cfg.login)}`)
      if (!user) throw new Error(`twitch user ${cfg.login} not found`)
      return user.id
    },
    async getLiveStream(userId: string): Promise<HelixStream | null> {
      const [stream] = await helix<HelixStream>(`/streams?user_id=${userId}&type=live`)
      return stream ?? null
    },
    /**
     * Up to 100 clips (Helix sorts them by views). With a range, only clips created inside it;
     * Helix needs both ends, otherwise it assumes one week after `from`.
     */
    getClips(userId: string, range?: { from: string; to: string }): Promise<HelixClip[]> {
      const window = range ? `&started_at=${range.from}&ended_at=${range.to}` : ''
      return helix<HelixClip>(`/clips?broadcaster_id=${userId}&first=100${window}`)
    },
    /** Up to 100 most recent past broadcasts (the most Helix returns per page). */
    getArchives(userId: string): Promise<HelixVideo[]> {
      return helix<HelixVideo>(`/videos?user_id=${userId}&type=archive&first=100`)
    },
  }
}
