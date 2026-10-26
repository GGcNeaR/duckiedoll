<script setup lang="ts">
import ClipCard from '../components/ClipCard.vue'
import { clipThumbnailPlaceholder, clips, twitch } from '../content'
import { linkAttrs } from '../lib/links'
</script>

<template>
  <section id="clips" aria-labelledby="clips-title" class="flex flex-col gap-7">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h2 id="clips-title" class="m-0 font-pixel text-[clamp(32px,7vw,48px)] text-violet">favorite moments</h2>
      <a :href="twitch.clips" v-bind="linkAttrs(twitch.clips)" class="py-2.5 font-pixel text-lg">all clips on Twitch →</a>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-7">
      <ClipCard
        v-for="(clip, i) in clips"
        :key="i"
        :filename="`clip_${String(i + 1).padStart(2, '0')}.mp4`"
        :title="clip.title"
        :meta="`${clip.views} · ${clip.date}`"
        :thumbnail="clip.thumbnail"
        :thumbnail-placeholder="clipThumbnailPlaceholder"
        :href="clip.href"
        :tone="clip.tone"
      />
    </div>
  </section>
</template>
