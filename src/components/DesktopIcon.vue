<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'
import type { Tone } from '../content'
import { restartAnimation } from '../composables/useMotion'

defineProps<{ label: string; icon: IconName; tone?: Tone; expanded?: boolean; controls?: string }>()
const emit = defineEmits<{ select: [] }>()

const tile = ref<HTMLElement | null>(null)
function onClick() {
  restartAnimation(tile.value, 'bounce')
  emit('select')
}
</script>

<template>
  <!-- hover/focus/open shows the "selected desktop icon" look: lavender tile + dashed outline -->
  <button
    type="button"
    class="group flex w-full cursor-pointer flex-col items-center gap-3 rounded-window border-2 border-ink bg-white px-4 py-[22px] text-center font-sans text-ink focus-visible:outline-none"
    :aria-expanded="expanded"
    :aria-controls="controls"
    @click="onClick"
  >
    <span
      ref="tile"
      class="flex size-16 items-center justify-center rounded-[14px] outline-offset-3 transition-colors duration-150 group-hover:bg-lavender group-hover:outline-2 group-hover:outline-ink group-hover:outline-dashed group-focus-visible:bg-lavender group-focus-visible:outline-2 group-focus-visible:outline-ink group-focus-visible:outline-dashed group-aria-expanded:bg-lavender"
      :class="tone === 'pink' ? 'bg-pink-100 text-rose' : 'bg-lilac-100 text-link'"
    >
      <AppIcon :name="icon" :size="32" />
    </span>
    <span class="font-pixel text-lg">{{ label }}</span>
  </button>
</template>
