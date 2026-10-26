<script setup lang="ts">
import DesktopIcon from '../components/DesktopIcon.vue'
import { quests } from '../content'
</script>

<template>
  <section id="quests" aria-labelledby="quests-title" class="flex flex-col gap-7">
    <div>
      <p class="m-0 font-hand text-[30px] text-berry">hobbies? more like a lifestyle</p>
      <h2 id="quests-title" class="m-0 font-pixel text-[clamp(32px,7vw,48px)] text-violet">side quests</h2>
    </div>
    <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5 p-0">
      <li v-for="q in quests" :key="q.label">
        <DesktopIcon :label="q.label" :icon="q.icon" :tone="q.tone" class="h-full" />
      </li>
    </ul>
  </section>
</template>
