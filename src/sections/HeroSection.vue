<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import RetroWindow from '../components/RetroWindow.vue'
import AppButton from '../components/AppButton.vue'
import PixelHeart from '../components/PixelHeart.vue'
import AppIcon from '../components/AppIcon.vue'
import { affirmation, avatar, hero } from '../content'
import { motionAllowed, prefersReducedMotion } from '../composables/useMotion'
import { HEART_LIFETIME_MS, addHearts, makeHearts, type Heart } from '../lib/hearts'

const base = import.meta.env.BASE_URL
const withBase = (src: string) => (src && !/^https?:|^\//.test(src) ? base + src : src)
const avatarSrc = withBase(avatar.src)
const avatarSrcset = avatar.widths.map((w) => `${withBase(`avatar-${w}.webp`)} ${w}w`).join(', ')

// Boot bar: fills on every page load after the welcome window opens, counting up in the
// same 16 chunky steps as the CSS animation, then says "ready ✓".
const booting = ref(motionAllowed())
const percent = ref(booting.value ? 0 : 100)
/** animate "ready ✓" only after a real boot (not when motion is off) */
const justBooted = ref(false)
let counter: number | undefined

function onBootStart(e: AnimationEvent) {
  if (e.animationName !== 'boot') return
  let step = 0
  counter = window.setInterval(() => {
    percent.value = Math.round(++step * 6.25)
    if (step >= 16) window.clearInterval(counter)
  }, 100)
}
function finishBoot() {
  window.clearInterval(counter)
  percent.value = 100
  booting.value = false
  justBooted.value = true
}
function onBootEnd(e: AnimationEvent) {
  if (e.animationName === 'boot') finishBoot()
}
// motion switched off mid-boot: the animation (and its end event) is gone, so finish now
watch(prefersReducedMotion, (reduce) => reduce && booting.value && finishBoot())

// Pixel-heart burst (easter egg)
const hearts = ref<Heart[]>([])
let nextHeart = 0
const heartTimers = new Set<number>()

function burst() {
  if (!motionAllowed()) return
  const added = makeHearts(nextHeart)
  nextHeart += added.length
  hearts.value = addHearts(hearts.value, added)
  const ids = new Set(added.map((h) => h.id))
  const t = window.setTimeout(() => {
    hearts.value = hearts.value.filter((h) => !ids.has(h.id))
    heartTimers.delete(t)
  }, HEART_LIFETIME_MS)
  heartTimers.add(t)
}

onBeforeUnmount(() => {
  window.clearInterval(counter)
  heartTimers.forEach((t) => window.clearTimeout(t))
})
</script>

<template>
  <section aria-labelledby="hero-title" class="flex flex-wrap items-stretch gap-10">
    <RetroWindow v-reveal title="welcome.exe" class="flex-[1_1_560px]">
      <div class="flex grow flex-col gap-6 px-11 pt-12 pb-11 max-[640px]:px-[22px] max-[640px]:pt-7 max-[640px]:pb-6">
        <p class="m-0 font-hand text-[34px] font-bold text-berry">{{ hero.greeting }}</p>
        <h1 id="hero-title" class="m-0 font-pixel text-[clamp(46px,11vw,76px)] leading-[.98] font-bold text-violet">
          i'm {{ hero.name }}<PixelHeart :width="46" class="ml-3.5 inline-block align-middle" />
        </h1>
        <p class="m-0 max-w-[520px] text-xl leading-[1.55] text-body">{{ hero.intro }}</p>
        <div class="mt-2 flex flex-wrap gap-3.5">
          <AppButton :href="hero.primaryCta.href">{{ hero.primaryCta.label }}</AppButton>
          <AppButton variant="secondary" :href="hero.secondaryCta.href">{{ hero.secondaryCta.label }}</AppButton>
        </div>
        <!-- decorative boot bar -->
        <div aria-hidden="true" class="mt-auto flex flex-col gap-2 pt-5">
          <div class="flex justify-between font-pixel text-sm text-link">
            <span>{{ hero.loading.label }}</span>
            <span v-if="booting">{{ percent }}%</span>
            <span v-else class="text-[#2E7D4F]" :class="{ 'boot-ready': justBooted }">
              {{ hero.loading.readyLabel }}
            </span>
          </div>
          <div class="h-[22px] rounded border-2 border-ink bg-paper p-[3px]">
            <span
              class="boot-fill bg-[repeating-linear-gradient(90deg,#8B6CC9_0_14px,transparent_14px_17px)]"
              :class="{ 'boot-run': booting }"
              @animationstart="onBootStart"
              @animationend="onBootEnd"
            />
          </div>
        </div>
      </div>
    </RetroWindow>

    <div class="relative flex min-w-0 flex-[1_1_380px] flex-col gap-6">
      <RetroWindow v-reveal="{ delay: 80 }" title="untitled — paint" title-color="pink" :buttons="['#FFFFFF', '#FFFFFF']">
        <img
          v-if="avatarSrc"
          :src="avatarSrc"
          :srcset="avatarSrcset"
          sizes="(min-width: 1024px) 500px, calc(100vw - 72px)"
          :alt="avatar.alt"
          width="1200"
          height="1200"
          fetchpriority="high"
          class="block aspect-square h-auto w-full bg-lilac-100 object-cover"
        />
        <div
          v-else
          class="flex aspect-[4/4.2] flex-col items-center justify-center gap-3 bg-lilac-100 p-6 text-center text-link"
        >
          <AppIcon name="image" :size="56" :stroke-width="1.5" />
          <span class="font-pixel text-lg">{{ avatar.placeholder }}</span>
          <span class="max-w-[260px] text-sm">{{ avatar.placeholderNote }}</span>
        </div>
      </RetroWindow>

      <button
        v-reveal="{ delay: 160 }"
        type="button"
        class="press flex w-full items-center gap-4 rounded-window border-2 border-ink bg-ink px-5 py-[18px] text-left font-sans text-paper shadow-[4px_4px_0_var(--color-berry)] [--press-shadow:var(--color-berry)]"
        @click="burst"
      >
        <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="#F4A6C8" class="shrink-0">
          <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
        </svg>
        <span class="text-base leading-[1.45]">
          <strong class="block font-pixel text-lg font-semibold">{{ affirmation.title }}</strong>{{ affirmation.body }}
        </span>
      </button>

      <!-- hearts float up from the card over the avatar; clipped to this column -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <svg
          v-for="h in hearts"
          :key="h.id"
          class="heart"
          :width="h.size"
          :height="h.size"
          viewBox="0 0 7 6"
          shape-rendering="crispEdges"
          :style="{ left: `${h.left}%`, animationDelay: `${h.delay}ms` }"
        >
          <path :fill="h.color" d="M1 0h2v1h1V0h2v1h1v2h-1v1h-1v1h-1v1H3V5H2V4H1V3H0V1h1z" />
        </svg>
      </div>
    </div>
  </section>
</template>
