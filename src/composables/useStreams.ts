import { computed, onBeforeUnmount, onMounted, readonly, ref, shallowReadonly } from 'vue'
import type { StreamsResponse } from '../../shared/streams'
import { fetchStreams, readCached } from '../lib/streams'

// One shared copy of the stream data for the whole page (player + nav "watch live" pill).

const POLL_MS = 3 * 60 * 1000
// streams.json is generated and deployed with the site by the GitHub Action
const apiUrl = import.meta.env.VITE_STREAMS_API_URL || `${import.meta.env.BASE_URL}streams.json`

const data = ref<StreamsResponse | null>(null)
const status = ref<'loading' | 'ok' | 'stale' | 'error'>('loading')
const now = ref(new Date())
let lastFetch = 0
let users = 0
let timer: number | undefined

async function load() {
  lastFetch = Date.now()
  try {
    data.value = await fetchStreams(apiUrl)
    status.value = 'ok'
  } catch {
    // Keep showing what we had; otherwise fall back to the last payload this browser saw.
    if (!data.value) data.value = readCached()
    status.value = data.value ? 'stale' : 'error'
  }
  now.value = new Date()
}

function tick() {
  now.value = new Date()
  if (document.visibilityState === 'visible' && Date.now() - lastFetch >= POLL_MS) load()
}
function onVisible() {
  if (document.visibilityState === 'visible') tick()
}

function start() {
  load()
  timer = window.setInterval(tick, 30_000)
  document.addEventListener('visibilitychange', onVisible)
}
function stop() {
  window.clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisible)
}

export function useStreams() {
  onMounted(() => {
    if (users++ === 0) start()
  })
  onBeforeUnmount(() => {
    if (--users === 0) stop()
  })
  return {
    data: shallowReadonly(data),
    status: readonly(status),
    now: readonly(now),
    isLive: computed(() => !!data.value?.live),
  }
}
