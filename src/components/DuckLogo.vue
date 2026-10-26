<script setup lang="ts">
withDefaults(defineProps<{ size?: number; strokeWidth?: number }>(), { size: 26, strokeWidth: 1.8 })
</script>

<template>
  <svg
    aria-hidden="true"
    focusable="false"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8 7a3 3 0 1 1 6 0c0 1-.4 1.8-1 2.4 3.5.2 7 1.5 8 4.6-1.6 4-5.4 6-10 6-4 0-7-2-7-5.5 0-2.2 1.6-3.6 3.6-4.2A3 3 0 0 1 8 7z" />
    <path d="M14 6.5l3 .7-3 .8" />
  </svg>
</template>
