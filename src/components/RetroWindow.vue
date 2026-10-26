<script setup lang="ts">
import { computed } from 'vue'

type TitleColor = 'lavender' | 'pink' | 'dark'

const props = withDefaults(
  defineProps<{
    title: string
    titleColor?: TitleColor
    /** fill of each decorative window button, left to right */
    buttons?: string[]
    /** text-style controls ("_ □ ×") instead of boxes, as on the clip cards */
    glyphButtons?: boolean
    as?: string
    /** smaller title bar and shadow, used by ClipCard */
    compact?: boolean
  }>(),
  { titleColor: 'lavender', as: 'div', compact: false, glyphButtons: false },
)

const dark = computed(() => props.titleColor === 'dark')
const buttonFills = computed(
  () => props.buttons ?? (dark.value ? ['transparent', 'transparent'] : ['#F3EDFB', '#F3EDFB', '#F4A6C8']),
)
const bar = computed(
  () =>
    ({
      lavender: 'bg-lavender border-ink',
      pink: 'bg-pink border-ink',
      dark: 'bg-plum-600 border-grape',
    })[props.titleColor],
)
</script>

<template>
  <component
    :is="as"
    class="flex min-w-0 flex-col overflow-hidden rounded-window border-2 border-ink"
    :class="[dark ? 'bg-ink text-paper shadow-window-glow' : 'bg-white', !dark && (compact ? 'shadow-card' : 'shadow-window')]"
  >
    <div
      class="flex items-center justify-between gap-3 border-b-2 font-pixel"
      :class="[bar, compact ? 'px-3 py-2 text-[15px]' : 'px-3.5 py-2.5 text-base']"
    >
      <span class="min-w-0 truncate">{{ title }}</span>
      <span v-if="glyphButtons" aria-hidden="true" class="shrink-0">_ □ ×</span>
      <span v-else aria-hidden="true" class="flex shrink-0 gap-1.5">
        <span
          v-for="(fill, i) in buttonFills"
          :key="i"
          class="size-4 rounded-[3px] border-2"
          :class="dark ? 'border-lavender' : 'border-ink'"
          :style="{ background: fill }"
        />
      </span>
    </div>
    <slot />
  </component>
</template>
