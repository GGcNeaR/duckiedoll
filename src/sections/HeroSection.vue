<script setup lang="ts">
import RetroWindow from '../components/RetroWindow.vue'
import AppButton from '../components/AppButton.vue'
import PixelHeart from '../components/PixelHeart.vue'
import AppIcon from '../components/AppIcon.vue'
import { affirmation, avatar, hero } from '../content'

const base = import.meta.env.BASE_URL
const avatarSrc = avatar.src && !/^https?:|^\//.test(avatar.src) ? base + avatar.src : avatar.src
</script>

<template>
  <section aria-labelledby="hero-title" class="flex flex-wrap items-stretch gap-10">
    <RetroWindow title="welcome.exe" class="flex-[1_1_560px]">
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
        <div class="mt-auto flex flex-col gap-2 pt-5">
          <div class="flex justify-between font-pixel text-sm text-link">
            <span>{{ hero.loading.label }}</span><span>{{ hero.loading.percent }}%</span>
          </div>
          <div
            role="img"
            :aria-label="`Decorative progress bar at ${hero.loading.percent} percent`"
            class="flex h-[22px] gap-[3px] rounded border-2 border-ink bg-paper p-[3px]"
          >
            <span
              class="bg-[repeating-linear-gradient(90deg,#8B6CC9_0_14px,transparent_14px_17px)]"
              :style="{ flex: `0 0 calc(${hero.loading.percent}% - 3px)` }"
            />
          </div>
        </div>
      </div>
    </RetroWindow>

    <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-6">
      <RetroWindow title="untitled — paint" title-color="pink" :buttons="['#FFFFFF', '#FFFFFF']">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="avatar.alt" class="block aspect-[4/4.2] w-full bg-lilac-100 object-contain" />
        <div
          v-else
          class="flex aspect-[4/4.2] flex-col items-center justify-center gap-3 bg-lilac-100 p-6 text-center text-link"
        >
          <AppIcon name="image" :size="56" :stroke-width="1.5" />
          <span class="font-pixel text-lg">{{ avatar.placeholder }}</span>
          <span class="max-w-[260px] text-sm">{{ avatar.placeholderNote }}</span>
        </div>
      </RetroWindow>

      <div class="flex items-center gap-4 rounded-window bg-ink px-5 py-[18px] text-paper">
        <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="#F4A6C8" class="shrink-0">
          <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
        </svg>
        <p class="m-0 text-base leading-[1.45]">
          <strong class="font-pixel text-lg font-semibold">{{ affirmation.title }}</strong><br />{{ affirmation.body }}
        </p>
      </div>
    </div>
  </section>
</template>
