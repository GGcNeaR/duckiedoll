<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import RetroWindow from './RetroWindow.vue'
import type { StreamsResponse } from '../../shared/streams'
import {
  fetchStreams,
  formatDuration,
  formatShortDuration,
  localUsualTime,
  readCached,
  timeAgo,
  weekday,
} from '../lib/streams'
import { twitch } from '../content'
import { linkAttrs } from '../lib/links'

const POLL_MS = 3 * 60 * 1000
// streams.json is generated and deployed with the site by the GitHub Action
const apiUrl = import.meta.env.VITE_STREAMS_API_URL || `${import.meta.env.BASE_URL}streams.json`

const data = ref<StreamsResponse | null>(null)
const status = ref<'loading' | 'ok' | 'stale' | 'error'>('loading')
const now = ref(new Date())
let lastFetch = 0

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

const live = computed(() => data.value?.live ?? null)
const last = computed(() => data.value?.recent[0] ?? null)
const lastEndedAt = computed(() =>
  last.value ? new Date(new Date(last.value.startedAt).getTime() + last.value.duration * 1000).toISOString() : '',
)
const usual = computed(() => (data.value ? localUsualTime(data.value) : null))
const liveFor = computed(() =>
  live.value ? formatDuration((now.value.getTime() - new Date(live.value.startedAt).getTime()) / 1000) : '',
)

let timer: number | undefined
function tick() {
  now.value = new Date()
  if (document.visibilityState === 'visible' && Date.now() - lastFetch >= POLL_MS) load()
}
function onVisible() {
  if (document.visibilityState === 'visible') tick()
}

onMounted(() => {
  load()
  timer = window.setInterval(tick, 30_000)
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisible)
})
</script>

<template>
  <RetroWindow
    as="article"
    title="stream_player — now playing"
    title-color="dark"
    aria-labelledby="schedule-title"
    :aria-busy="status === 'loading'"
  >
    <div class="flex grow flex-col gap-[22px] p-7">
      <div class="flex flex-col gap-2.5 rounded-lg border-2 border-plum-600 bg-plum-900 px-5 py-[18px]">
        <!-- status line -->
        <div class="flex items-center justify-between gap-3 font-pixel text-[13px] tracking-[1px] text-lavender" aria-live="polite">
          <span class="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              class="size-[9px] shrink-0 rounded-full"
              :class="live ? 'bg-pink motion-safe:animate-pulse' : 'bg-offline'"
            />
            <template v-if="status === 'loading'">TUNING IN…</template>
            <template v-else-if="live">LIVE · {{ live.viewerCount.toLocaleString() }} WATCHING</template>
            <template v-else-if="last">OFFLINE · LAST ON AIR {{ timeAgo(lastEndedAt, now).toUpperCase() }}</template>
            <template v-else-if="status === 'error'">OFFLINE · CAN'T REACH TWITCH</template>
            <template v-else>OFFLINE</template>
          </span>
          <span v-if="live" class="shrink-0"><span class="sr-only">live for </span>{{ liveFor }}</span>
          <span v-else-if="last" class="shrink-0"><span class="sr-only">duration </span>{{ formatDuration(last.duration) }}</span>
        </div>

        <!-- title -->
        <p v-if="status === 'loading'" class="m-0 h-[30px] w-3/4 animate-pulse rounded bg-plum-700" aria-hidden="true" />
        <p v-else class="m-0 font-pixel text-[26px] leading-[1.15] break-words text-paper">
          <template v-if="live">{{ live.title }}</template>
          <template v-else-if="last">{{ last.title }}</template>
          <template v-else>catch me on Twitch — streams pop up here</template>
        </p>

        <div aria-hidden="true" class="h-1.5 rounded-[3px] bg-plum-700">
          <span class="block size-full rounded-[3px]" :class="live ? 'bg-pink' : 'bg-lavender'" />
        </div>

        <a v-if="live" :href="twitch.channel" v-bind="linkAttrs(twitch.channel)" class="focus-light self-start py-2 font-pixel text-[15px] text-pink hover:text-paper">watch now →</a>
        <a
          v-else-if="status !== 'loading'"
          :href="last?.url || twitch.videos"
          v-bind="linkAttrs(last?.url || twitch.videos)"
          class="focus-light self-start py-2 font-pixel text-[15px] text-pink hover:text-paper"
        >{{ last ? 'replay it →' : 'past streams →' }}</a>
        <p v-if="status === 'stale'" class="m-0 text-[13px] text-haze">Showing saved info — Twitch is taking a nap.</p>
      </div>

      <h2 id="schedule-title" class="m-0 font-pixel text-[22px] font-semibold">recently streamed</h2>

      <ol v-if="status === 'loading'" class="m-0 flex list-none flex-col gap-1 p-0" aria-hidden="true">
        <li v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-md bg-plum-700" />
      </ol>
      <ol v-else-if="data?.recent.length" class="m-0 flex list-none flex-col gap-1 p-0 text-base">
        <li v-for="(s, i) in data.recent.slice(0, 4)" :key="s.startedAt">
          <a
            :href="s.url"
            v-bind="linkAttrs(s.url)"
            :title="s.title"
            class="focus-light flex justify-between gap-3 rounded-md bg-plum-700 px-3.5 py-3 text-paper no-underline hover:bg-plum-600 hover:text-paper"
          >
            <span class="min-w-0 truncate">
              <span class="font-pixel text-lavender">{{ String(i + 1).padStart(2, '0') }}.</span> {{ s.title }}
            </span>
            <span class="shrink-0 font-pixel text-lavender">
              {{ weekday(s.startedAt) }} · {{ formatShortDuration(s.duration) }}
            </span>
          </a>
        </li>
      </ol>
      <p v-else class="m-0 rounded-md bg-plum-700 px-3.5 py-3 text-base">
        <template v-if="status === 'error'">The stream list is napping right now —</template>
        <template v-else>No streams to show yet —</template>
        <a :href="twitch.videos" v-bind="linkAttrs(twitch.videos)" class="focus-light text-pink hover:text-paper">see past broadcasts on Twitch</a>.
      </p>

      <p class="mt-auto mb-0 text-sm text-lavender">
        <template v-if="usual">Usually live in the {{ usual }} · updates automatically from Twitch</template>
        <template v-else>Updates automatically from Twitch</template>
      </p>
    </div>
  </RetroWindow>
</template>
