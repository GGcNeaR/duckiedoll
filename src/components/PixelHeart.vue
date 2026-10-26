<script setup lang="ts">
withDefaults(defineProps<{ width?: number; color?: string }>(), { width: 12, color: '#F4A6C8' })
</script>

<template>
  <svg
    aria-hidden="true"
    focusable="false"
    :width="width"
    :height="Math.round((width * 6) / 7)"
    viewBox="0 0 7 6"
    shape-rendering="crispEdges"
  >
    <path :fill="color" d="M1 0h2v1h1V0h2v1h1v2h-1v1h-1v1h-1v1H3V5H2V4H1V3H0V1h1z" />
  </svg>
</template>
