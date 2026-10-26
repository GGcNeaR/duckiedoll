<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'
import { linkAttrs } from '../lib/links'

defineProps<{ href: string; icon: IconName; title: string; blurb: string; cta: string }>()
</script>

<template>
  <a
    :href="href"
    v-bind="linkAttrs(href)"
    class="group focus-light flex flex-col items-center gap-3.5 rounded-[14px] border-[1.5px] border-plum-600 px-[22px] py-7 text-center text-paper no-underline transition-colors hover:border-lavender hover:text-paper"
  >
    <AppIcon :name="icon" :size="44" :stroke-width="1.5" class="text-glow" />
    <span class="font-pixel text-xl">{{ title }}</span>
    <span class="text-[15px] text-haze">{{ blurb }}</span>
    <span
      class="mt-auto rounded-full border-[1.5px] border-lavender px-4 py-2 font-pixel text-[15px] transition-colors group-hover:bg-link group-hover:text-white group-focus-visible:bg-link group-focus-visible:text-white"
    >{{ cta }}</span>
  </a>
</template>
