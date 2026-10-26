<script setup lang="ts">
import RetroWindow from '../components/RetroWindow.vue'
import PixelHeart from '../components/PixelHeart.vue'
import StreamPlayer from '../components/StreamPlayer.vue'
import { about } from '../content'
</script>

<template>
  <section class="flex flex-wrap items-stretch gap-10" aria-label="About and streams">
    <RetroWindow
      id="about"
      as="article"
      title="about_me.txt"
      aria-labelledby="about-title"
      :buttons="['#F3EDFB', '#F4A6C8']"
      class="flex-[1_1_520px]"
    >
      <div class="flex flex-col gap-6 p-9 max-[640px]:px-[22px] max-[640px]:pt-7 max-[640px]:pb-6">
        <h2 id="about-title" class="m-0 font-hand text-[52px] leading-none text-violet">about me</h2>
        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-4">
          <div v-for="fact in about.facts" :key="fact.label">
            <dt class="font-pixel text-sm text-muted">{{ fact.label }}</dt>
            <dd class="mt-1 mb-0 ml-0 text-xl font-bold break-words">{{ fact.value }}</dd>
          </div>
        </dl>
        <div class="flex flex-col gap-3 border-t-2 border-dashed border-dot pt-[22px]">
          <h3 class="m-0 font-pixel text-lg font-semibold">fun facts</h3>
          <ul class="m-0 flex list-none flex-col gap-2.5 p-0 text-[17px] leading-[1.45]">
            <li v-for="fact in about.funFacts" :key="fact" class="flex items-baseline gap-2.5">
              <PixelHeart :width="12" color="#C2477F" class="shrink-0" />{{ fact }}
            </li>
          </ul>
        </div>
      </div>
    </RetroWindow>

    <StreamPlayer id="schedule" class="flex-[1_1_400px]" />
  </section>
</template>
