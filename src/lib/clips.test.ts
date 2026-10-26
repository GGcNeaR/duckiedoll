import { describe, expect, it } from 'vitest'
import { chooseClips, formatClipDate, formatViews } from './clips'
import type { Clip } from '../content'

const placeholder = (tone: Clip['tone']): Clip => ({ title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone })
const auto = [
  { title: 'newest', url: 'https://clips.twitch.tv/n', thumbnailUrl: 'https://img/n.jpg', viewCount: 1234, createdAt: '2026-10-24T12:00:00Z' },
  { title: 'older', url: 'https://clips.twitch.tv/o', thumbnailUrl: 'https://img/o.jpg', viewCount: 1, createdAt: '2025-12-01T12:00:00Z' },
]
const NOW = new Date('2026-10-26T12:00:00Z')

describe('chooseClips', () => {
  it('uses Twitch clips when none are set', () => {
    const shown = chooseClips([placeholder('lilac'), placeholder('pink'), placeholder('lilac')], auto, NOW)
    expect(shown).toEqual([
      { title: 'newest', meta: '1,234 views · Oct 24', thumbnail: 'https://img/n.jpg', href: 'https://clips.twitch.tv/n', tone: 'lilac' },
      { title: 'older', meta: '1 view · Dec 1, 2025', thumbnail: 'https://img/o.jpg', href: 'https://clips.twitch.tv/o', tone: 'pink' },
    ])
  })
  it('prefers clips set in content.ts', () => {
    const mine: Clip = { title: 'my fave', views: '2K views', date: 'Oct 1', thumbnail: 'fave.jpg', href: 'https://clips.twitch.tv/fave', tone: 'pink' }
    const shown = chooseClips([mine, placeholder('pink'), placeholder('lilac')], auto, NOW)
    expect(shown).toEqual([{ title: 'my fave', meta: '2K views · Oct 1', thumbnail: 'fave.jpg', href: 'https://clips.twitch.tv/fave', tone: 'pink' }])
  })
  it('falls back to the placeholders with no data', () => {
    expect(chooseClips([placeholder('lilac')], undefined, NOW)).toEqual([
      { title: '[CLIP TITLE]', meta: '[VIEWS] · [DATE]', thumbnail: '', href: '', tone: 'lilac' },
    ])
    expect(chooseClips([placeholder('lilac')], [], NOW)).toHaveLength(1)
  })
})

describe('formatting', () => {
  it('formats views and dates', () => {
    expect(formatViews(0)).toBe('0 views')
    expect(formatViews(1)).toBe('1 view')
    expect(formatViews(98765)).toBe('98,765 views')
    expect(formatClipDate('2026-03-05T12:00:00Z', NOW)).toBe('Mar 5')
    expect(formatClipDate('2024-03-05T12:00:00Z', NOW)).toBe('Mar 5, 2024')
  })
})
