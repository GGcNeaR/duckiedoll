<script setup lang="ts">
import { linkAttrs } from '../lib/links'

withDefaults(defineProps<{ variant?: 'primary' | 'secondary'; href?: string }>(), { variant: 'primary' })
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    v-bind="linkAttrs(href)"
    :type="href ? undefined : 'button'"
    class="lift inline-flex cursor-pointer items-center justify-center rounded-[10px] border-2 border-ink px-6 py-4 font-pixel text-[19px] font-semibold no-underline shadow-btn"
    :class="variant === 'primary' ? 'bg-violet text-white hover:text-white' : 'bg-white text-ink hover:text-ink'"
  >
    <slot />
  </component>
</template>
