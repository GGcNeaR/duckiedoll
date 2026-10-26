<script setup lang="ts">
import { footer } from '../content'
</script>

<template>
  <footer
    class="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 pt-14 pb-12 font-pixel text-[15px] text-link"
  >
    <span>{{ footer.text }}</span>
    <a href="#top" class="py-2.5">back to top ↑</a>
  </footer>
</template>
