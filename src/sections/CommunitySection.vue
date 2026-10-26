<script setup lang="ts">
import CommunityCard from '../components/CommunityCard.vue'
import { community } from '../content'
</script>

<template>
  <section
    id="community"
    aria-labelledby="community-title"
    class="flex flex-col gap-9 rounded-[20px] bg-night px-10 py-14 text-paper max-[640px]:px-5 max-[640px]:py-10"
  >
    <div class="flex flex-col items-center gap-2 text-center">
      <p class="m-0 font-hand text-[32px] text-pink">come hang out</p>
      <h2 id="community-title" class="m-0 font-pixel text-[clamp(32px,7vw,48px)]">the flock is EGG-cellent</h2>
    </div>
    <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-5 p-0">
      <li v-for="(c, i) in community" :key="c.title" class="flex">
        <CommunityCard v-reveal="{ delay: i * 80 }" v-bind="c" class="w-full" />
      </li>
    </ul>
  </section>
</template>
