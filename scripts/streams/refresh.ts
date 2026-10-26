// Fetch Twitch data, update the stored broadcast history and write the site's streams.json.
// Run by .github/workflows/site.yml on a schedule; locally: `npm run streams:refresh`.
//
// env: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_LOGIN (default duckiedoll),
//      HISTORY_DIR (default .stream-data), OUT_FILE (default public/streams.json),
//      TWITCH_API_BASE (optional, mock server for testing)

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { StreamsResponse } from '../../shared/streams'
import type { ClipInfo } from '../../shared/streams'
import {
  buildResponse,
  markDeletedVods,
  mergeArchives,
  pickRecentClips,
  recordLive,
  responseChanged,
  type Broadcast,
} from './history'
import { createTwitchClient } from './twitch'

// local runs: pick up credentials from .env if present (CI passes them as env vars)
try {
  process.loadEnvFile()
} catch {
  /* no .env */
}

const env = process.env
const login = env.TWITCH_LOGIN || 'duckiedoll'
const historyDir = env.HISTORY_DIR || '.stream-data'
const outFile = env.OUT_FILE || 'public/streams.json'
const historyFile = join(historyDir, 'history.json')
// last published payload, kept next to the history to decide whether a redeploy is needed
const publishedFile = join(historyDir, 'streams.json')

function readJson<T>(file: string, fallback: T): T {
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : fallback
}

function writeJson(file: string, data: unknown) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
  console.error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set')
  process.exit(1)
}

const twitch = createTwitchClient({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  login,
  apiBase: env.TWITCH_API_BASE,
})

const now = new Date().toISOString()
const userId = await twitch.getUserId()
const [live, videos] = await Promise.all([twitch.getLiveStream(userId), twitch.getArchives(userId)])

let history = readJson<Broadcast[]>(historyFile, [])
history = markDeletedVods(mergeArchives(history, videos, now), videos)
if (live) history = recordLive(history, live, now)

const published = readJson<StreamsResponse | null>(publishedFile, null)

// Newest clips: look at the last 90 days first, fall back to all-time if that's too few.
// A clips failure keeps the last good clips rather than failing the whole refresh.
let clips: ClipInfo[] = published?.clips ?? []
try {
  const range = { from: new Date(Date.parse(now) - 90 * 86400_000).toISOString(), to: now }
  let found = await twitch.getClips(userId, range)
  if (found.length < 3) found = [...found, ...(await twitch.getClips(userId))]
  clips = pickRecentClips(found)
} catch (err) {
  console.warn('clips refresh failed, keeping previous clips:', err)
}

const response = buildResponse(history, live, login, now, clips)
const changed = responseChanged(published, response)

writeJson(historyFile, history)
writeJson(publishedFile, response)
writeJson(outFile, response)

console.log(
  `${live ? `LIVE: ${live.title}` : 'offline'} · ${history.length} broadcasts stored · ${clips.length} clips · ${changed ? 'changed' : 'unchanged'}`,
)
if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `changed=${changed}\n`)
