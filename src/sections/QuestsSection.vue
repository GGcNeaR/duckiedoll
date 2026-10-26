<script setup lang="ts">
import { computed, ref } from 'vue'
import DesktopIcon from '../components/DesktopIcon.vue'
import RetroWindow from '../components/RetroWindow.vue'
import { quests } from '../content'

// One "<hobby>.txt" note open at a time; clicking the open hobby again closes it.
const openLabel = ref<string | null>(null)
const openQuest = computed(() => quests.find((q) => q.label === openLabel.value) ?? null)

function select(label: string) {
  openLabel.value = openLabel.value === label ? null : label
}
const noteName = (label: string) => `${label.split('.')[0]}.txt`
</script>

<template>
  <section id="quests" aria-labelledby="quests-title" class="flex flex-col gap-7">
    <div>
      <p class="m-0 font-hand text-[30px] text-berry">hobbies? more like a lifestyle</p>
      <h2 id="quests-title" class="m-0 font-pixel text-[clamp(32px,7vw,48px)] text-violet">side quests</h2>
    </div>
    <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5 p-0">
      <li v-for="q in quests" :key="q.label">
        <DesktopIcon
          :label="q.label"
          :icon="q.icon"
          :tone="q.tone"
          :expanded="openLabel === q.label"
          controls="quest-note"
          class="h-full"
          @select="select(q.label)"
        />
      </li>
    </ul>
    <!-- stays in the DOM (live region); pulls up the section gap while empty -->
    <div id="quest-note" aria-live="polite" :class="{ '-mt-7': !openQuest }">
      <RetroWindow
        v-if="openQuest"
        :key="openQuest.label"
        v-reveal
        compact
        title-color="butter"
        :buttons="[]"
        :title="noteName(openQuest.label)"
        class="max-w-[520px]"
      >
        <p class="m-0 px-4 py-3.5 text-[15px]">{{ openQuest.note }}</p>
      </RetroWindow>
    </div>
  </section>
</template>
