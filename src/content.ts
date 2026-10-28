// Everything Duckie might want to edit lives here.
// Anything still in [BRACKETS] is a placeholder waiting for real content.

import type { IconName } from './components/icons'
import type { DuckAccessory } from './components/duckAccessories'

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
  { label: 'side quests', href: '#quests' },
  { label: 'pond', href: '#pond' },
  { label: 'clips', href: '#clips' },
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
  /** Square image in /public; `widths` lists the sizes saved as avatar-<width>.webp (empty src shows the placeholder) */
  src: 'avatar-1200.webp',
  widths: [640, 1200],
  alt: 'Pixel-art portrait of Duckie with eyes closed, wearing lavender headphones covered in daisies, in front of retro Windows desktop windows',
  placeholder: '[YOUR ANIME AVATAR ART]',
  placeholderNote: 'Her square portrait goes here.',
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

// Leave every `href` empty to show her newest Twitch clips automatically (fetched by the
// GitHub Action). As soon as any clip here has an `href`, only the clips set here are shown.
export const clips: Clip[] = [
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'lilac' },
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'pink' },
  { title: '[CLIP TITLE]', views: '[VIEWS]', date: '[DATE]', thumbnail: '', href: '', tone: 'lilac' },
]
export const clipThumbnailPlaceholder = '[CLIP THUMBNAIL]'

export interface PondDuck {
  /** their Twitch name, shown under the duck */
  name: string
  /** body colour, #rrggbb */
  color: string
  /** their own lines; ducks also say the generic ones. Leave out for generic quacks only. */
  lines?: string[]
  /** things to wear, see src/components/duckAccessories.ts (e.g. ['swept-hair', 'glasses']) */
  accessories?: DuckAccessory[]
}

// The pond: one duck per viewer who asked to be in it (only add people who said yes!).
// Up to 12 swim at once (6 on phones); with more, a random set shows on each visit.
// Pick colours that stand out from the lavender water (avoid lavender/purple).
// An empty `ducks` list hides the section and its nav link.
export const pond: { title: string; blurb: string; breadLabel: string; genericLines: string[]; ducks: PondDuck[] } = {
  title: 'the pond',
  blurb: 'Every duck here is one of the flock. Want to be a duck? Ask in chat!',
  breadLabel: 'throw bread',
  genericLines: ['quack!', 'first!!', 'is she live yet?', '*paddles happily*', 'hi chat', 'bread? 👀', 'quack quack', 'o7'],
  ducks: [
    { name: '[VIEWER 1]', color: '#FFE27A', lines: ['[THEIR CATCHPHRASE]'] },
    { name: 'chukaime', color: '#F4A6C8' },
    { name: '[VIEWER 3]', color: '#F7B267', lines: ['[THEIR CATCHPHRASE]'] },
    { name: '34tm4n', color: '#3A3546', accessories: ['bat-mask'], lines: ["I'm Batman!"] },
    { name: 'akshaykhanna', color: '#F7D9B0', accessories: ['swept-hair', 'glasses'] },
    { name: '[VIEWER 6]', color: '#FFC09F', lines: ['[THEIR CATCHPHRASE]'] },
    { name: 'Damirox_PL', color: '#A9D3F5' },
    { name: '[VIEWER 8]', color: '#FFE27A' },
  ],
}

export const community:{ title: string; blurb: string; cta: string; href: string; icon: IconName }[] = [
  // [TODO] Discord invite link
  { title: 'Discord', blurb: 'Chat between streams', cta: 'join', href: '#', icon: 'discord' },
  { title: 'Instagram', blurb: 'Selfies, doodles and cozy bits', cta: 'peek', href: 'https://www.instagram.com/duckiedoll', icon: 'instagram' },
  // [TODO] TikTok profile link
  { title: 'TikTok', blurb: 'Bite-sized side quests', cta: 'follow', href: '#', icon: 'tiktok' },
  { title: 'Patreon', blurb: 'Extra cozy perks and behind-the-scenes — thank u ^.^', cta: 'join', href: 'https://www.patreon.com/cw/duckiedoll21', icon: 'patreon' },
]

export const footer = {
  text: '© duckiedoll',
}
