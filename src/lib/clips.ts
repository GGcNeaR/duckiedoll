import type { ClipInfo } from '../../shared/streams'
import type { Clip, Tone } from '../content'

export interface ClipCardData {
  title: string
  meta: string
  thumbnail: string
  href: string
  tone: Tone
}

const TONES: Tone[] = ['lilac', 'pink', 'lilac']

/** "1,234 views", "1 view" */
export function formatViews(n: number, locale = 'en'): string {
  return `${n.toLocaleString(locale)} ${n === 1 ? 'view' : 'views'}`
}

/** "Oct 24", or "Oct 24, 2025" when not this year */
export function formatClipDate(iso: string, now: Date = new Date(), locale = 'en'): string {
  const d = new Date(iso)
  const sameYear = d.getFullYear() === now.getFullYear()
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) }).format(d)
}

/**
 * Clips to show: the ones set in content.ts if any has a link (she picked them), otherwise
 * the newest clips from Twitch, otherwise the placeholder cards.
 */
export function chooseClips(configured: Clip[], auto: readonly ClipInfo[] | undefined, now: Date = new Date()): ClipCardData[] {
  const picked = configured.filter((c) => c.href)
  if (picked.length) {
    return picked.map((c) => ({ title: c.title, meta: `${c.views} · ${c.date}`, thumbnail: c.thumbnail, href: c.href, tone: c.tone }))
  }
  if (auto?.length) {
    return auto.slice(0, 3).map((c, i) => ({
      title: c.title,
      meta: `${formatViews(c.viewCount)} · ${formatClipDate(c.createdAt, now)}`,
      thumbnail: c.thumbnailUrl,
      href: c.url,
      tone: TONES[i % TONES.length],
    }))
  }
  return configured.map((c) => ({ title: c.title, meta: `${c.views} · ${c.date}`, thumbnail: c.thumbnail, href: c.href, tone: c.tone }))
}
