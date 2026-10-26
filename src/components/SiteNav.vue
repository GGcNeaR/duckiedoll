<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DuckLogo from './DuckLogo.vue'
import { nav, twitch } from '../content'
import { linkAttrs } from '../lib/links'
import { useStreams } from '../composables/useStreams'
import { usePageVisible } from '../composables/useMotion'

const open = ref(false)
const { isLive } = useStreams()
const pageVisible = usePageVisible()
const menuButton = ref<HTMLButtonElement | null>(null)

function close(returnFocus = false) {
  open.value = false
  if (returnFocus) menuButton.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close(true)
}

// The menu only exists at <=640px; close it if the viewport grows past that.
let wide: MediaQueryList | undefined
const onWide = (e: MediaQueryListEvent) => e.matches && close()

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onMounted(() => {
  wide = window.matchMedia('(min-width: 641px)')
  wide.addEventListener('change', onWide)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  wide?.removeEventListener('change', onWide)
})
</script>

<template>
  <header class="sticky top-0 z-10 border-b-[3px] border-lavender bg-ink text-paper">
    <nav aria-label="Main" class="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 py-3">
      <a href="#top" class="focus-light flex items-center gap-2.5 text-paper no-underline hover:text-paper">
        <span class="flex size-10 items-center justify-center rounded-[10px] bg-lavender text-ink">
          <DuckLogo />
        </span>
        <span class="font-pixel text-[22px] font-bold tracking-[.5px]">duckiedoll</span>
      </a>

      <ul class="m-0 flex list-none flex-wrap gap-1 p-0 font-pixel text-[17px] max-[640px]:hidden">
        <li v-for="item in nav" :key="item.href">
          <a
            :href="item.href"
            class="focus-light block rounded-lg px-3.5 py-2.5 text-paper no-underline hover:bg-plum-700 hover:text-paper"
          >{{ item.label }}</a>
        </li>
      </ul>

      <a
        :href="twitch.channel"
        v-bind="linkAttrs(twitch.channel)"
        class="press flex items-center gap-2 rounded-full border-2 border-paper bg-pink px-4 py-2.5 font-pixel text-base font-semibold text-ink no-underline [--press-ring:var(--color-paper)] hover:text-ink max-[640px]:hidden"
      >
        <span
          aria-hidden="true"
          class="size-2.5 rounded-full bg-ink"
          :class="isLive && ['live-dot live-dot-ink', { 'is-paused': !pageVisible }]"
        />
        watch live
      </a>

      <button
        ref="menuButton"
        type="button"
        class="burger focus-light hidden size-12 flex-col items-center justify-center gap-[4.5px] rounded-[10px] border-2 border-paper bg-lavender p-0 text-ink max-[640px]:flex"
        :class="{ 'is-open': open }"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        @click="open = !open"
      >
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </button>
    </nav>

    <!-- opening: items slide in, 30ms apart; closing: the whole panel fades (menu-leave-* in motion.css) -->
    <Transition name="menu">
      <div
        v-show="open"
        id="mobile-menu"
        class="flex flex-col gap-0.5 border-t-2 border-plum-600 px-4 pt-2 pb-6 font-pixel text-[22px] min-[641px]:hidden"
      >
        <ul class="m-0 list-none p-0">
          <li v-for="(item, i) in nav" :key="item.href" class="menu-item" :style="{ animationDelay: `${i * 30}ms` }">
            <a
              :href="item.href"
              class="focus-light block rounded-lg px-2.5 py-3.5 text-paper no-underline hover:bg-plum-700 hover:text-paper"
              :class="i < nav.length - 1 && 'border-b border-dashed border-plum-600'"
              @click="close()"
            >{{ item.label }}</a>
          </li>
        </ul>
        <a
          :href="twitch.channel"
          v-bind="linkAttrs(twitch.channel)"
          class="menu-item focus-light mt-3.5 flex items-center justify-center gap-2.5 rounded-full bg-pink p-4 text-[19px] font-semibold text-ink no-underline hover:text-ink"
          :style="{ animationDelay: `${nav.length * 30}ms` }"
        >
          <span
            aria-hidden="true"
            class="size-2.5 rounded-full bg-ink"
            :class="isLive && ['live-dot live-dot-ink', { 'is-paused': !pageVisible }]"
          />
          watch live
        </a>
      </div>
    </Transition>
  </header>
</template>
