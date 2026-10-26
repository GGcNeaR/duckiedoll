<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'
import type { Tone } from '../content'

defineProps<{ label: string; icon: IconName; tone?: Tone }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-window border-2 border-ink bg-white px-4 py-[22px] text-center">
    <span
      class="flex size-16 items-center justify-center rounded-[14px]"
      :class="tone === 'pink' ? 'bg-pink-100 text-rose' : 'bg-lilac-100 text-link'"
    >
      <AppIcon :name="icon" :size="32" />
    </span>
    <span class="font-pixel text-lg">{{ label }}</span>
  </div>
</template>
