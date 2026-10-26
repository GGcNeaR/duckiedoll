// Everything Duckie might want to edit lives here.
// Anything still in [BRACKETS] is a placeholder waiting for real content.

import type { IconName } from './components/icons'

export type Tone = 'lilac' | 'pink'

export const twitch = {
  login: 'duckiedoll',
  channel: 'https://twitch.tv/duckiedoll',
  videos: 'https://twitch.tv/duckiedoll/videos',
  clips: 'https://twitch.tv/duckiedoll/clips',
}

export const nav = [
  { label: 'about', href: '#about' },
  { label: 'streams', href: '#schedule' },
  { label: 'clips', href: '#clips' },
  { label: 'side quests', href: '#quests' },
  { label: 'community', href: '#community' },
]

export const hero = {
  greeting: 'hii, welcome in!',
  name: 'Duckie',
  intro:
    'Cozy Twitch streams from Bulgaria — anime talk, drawing, knitting, baking and a little bit of side quests. A family-friendly corner of the internet where chat is always kind.',
  primaryCta: { label: 'Watch on Twitch', href: twitch.channel },
  secondaryCta: { label: 'Join the flock', href: '#community' },
  loading: { label: 'loading good vibes...', readyLabel: 'ready ✓' },
}

export const avatar = {
  /** Put the transparent PNG in /public and set e.g. src: 'avatar.png' */
  src: '',
  alt: 'Duckie’s anime avatar: lavender hoodie, a bow and a cat',
  placeholder: '[YOUR ANIME AVATAR ART]',
  placeholderNote: 'The lavender-hoodie avatar with the bow and cat goes here — transparent PNG.',
}

export const affirmation = {
  title: 'you are truly: amazing.',
  body: 'Thanks for stopping by the pond.',
}

export const about = {
  facts: [
    { label: 'name', value: 'Duckie / Paty' },
    { label: 'from', value: 'Bulgaria' },
    { label: 'house', value: 'Gryffindor' },
    { label: 'personality', value: 'INFJ' },
  ],
  funFacts: ['Shorter than Ariana Grande.', 'Can guess the celebrity just by their mouth.'],
}

/** `note` is shown in a little "<hobby>.txt" window when the icon is clicked */
export const quests: { label: string; icon: IconName; tone: Tone; note: string }[] = [
  { label: 'anime.exe', icon: 'tv', tone: 'lilac', note: 'Currently watching: [ANIME TITLE]' },
  { label: 'books.lnk', icon: 'book', tone: 'pink', note: 'On the nightstand: [BOOK TITLE]' },
  { label: 'drawing.bmp', icon: 'pen', tone: 'lilac', note: 'Latest doodle: [LINK TO ART]' },
  { label: 'knitting.zip', icon: 'yarn', tone: 'pink', note: 'On the needles: [PROJECT]' },
  { label: 'baking.dll', icon: 'cake', tone: 'lilac', note: 'Last bake: [RECIPE]' },
  { label: 'yapping.wav', icon: 'chat', tone: 'pink', note: 'Every stream. No exceptions.' },
]

export interface Clip {
  title: string
  views: string
  date: string
  /** image URL (or file in /public); empty shows the placeholder */
  thumbnail: string
  /** Twitch clip URL; empty renders the card without a link */
  href: string
  tone: Tone
}

export const clips: Clip[] = [
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'lilac' },
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'pink' },
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'lilac' },
]
export const clipThumbnailPlaceholder = '[CLIP THUMBNAIL]'

export const community: { title: string; blurb: string; cta: string; href: string; icon: IconName }[] = [
  // [TODO] Discord invite link
  { title: 'Discord', blurb: 'Chat between streams', cta: 'join', href: '#', icon: 'discord' },
  // [TODO] TikTok profile link
  { title: 'TikTok', blurb: 'Bite-sized side quests', cta: 'follow', href: '#', icon: 'tiktok' },
  { title: 'Wishlist', blurb: 'Craft supplies and cozy things', cta: 'peek', href: 'https://throne.com/duckiedoll', icon: 'gift' },
  // [TODO] tip / support link
  { title: 'Support', blurb: 'Only if you have the funds — thank u ^.^', cta: 'tip', href: '#', icon: 'piggy' },
]

export const footer = {
  text: '© duckiedoll',
}
