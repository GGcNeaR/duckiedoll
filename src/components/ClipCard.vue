<script setup lang="ts">
import RetroWindow from './RetroWindow.vue'
import type { Tone } from '../content'
import { linkAttrs } from '../lib/links'

defineProps<{
  filename: string
  title: string
  meta: string
  thumbnail?: string
  thumbnailPlaceholder: string
  href?: string
  tone?: Tone
}>()
</script>

<template>
  <RetroWindow as="article" compact glyph-buttons :title="filename" :title-color="tone === 'pink' ? 'pink' : 'lavender'">
    <div
      class="flex aspect-video items-center justify-center font-pixel"
      :class="tone === 'pink' ? 'bg-pink-100 text-rose' : 'bg-lilac-100 text-link'"
    >
      <img v-if="thumbnail" :src="thumbnail" alt="" class="size-full object-cover" loading="lazy" />
      <span v-else>{{ thumbnailPlaceholder }}</span>
    </div>
    <div class="px-[18px] py-4">
      <h3 class="m-0 text-[17px] font-bold">
        <a v-if="href" :href="href" v-bind="linkAttrs(href)" class="text-ink no-underline hover:underline">{{ title }}</a>
        <template v-else>{{ title }}</template>
      </h3>
      <p class="mt-1 mb-0 text-sm text-muted">{{ meta }}</p>
    </div>
  </RetroWindow>
</template>
