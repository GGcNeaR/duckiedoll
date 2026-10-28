<script setup lang="ts">
import { ref, watch } from 'vue'
import RetroWindow from '../components/RetroWindow.vue'
import PixelDuck from '../components/PixelDuck.vue'
import PixelSprite from '../components/PixelSprite.vue'
import { pond } from '../content'
import { MAX_DUCKS_NARROW, MAX_DUCKS_WIDE, pickDucks } from '../lib/pond'
import { usePond } from '../composables/usePond'
import { useInViewport } from '../composables/useMotion'

const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
const shown = pickDucks(pond.ducks, narrow ? MAX_DUCKS_NARROW : MAX_DUCKS_WIDE)
// each duck bobs out of step with the others
const bobDelays = shown.map(() => `${-Math.round(Math.random() * 900)}ms`)

const pondEl = ref<HTMLElement | null>(null)
const { setDuckEl, bubbleEl, bubble, crumbs, announcement, running, onDuckClick, onDuckFocus, hold, throwBreadAt, onWaterClick } =
  usePond(shown, pond.genericLines, pondEl)

function setBubbleEl(el: unknown) {
  bubbleEl.value = (el as HTMLElement | null) ?? null
}

// Ducks and decorations are only built once the pond is nearly on screen, so they add
// nothing to the first page load. The pond's box (and so the layout) is there from the start.
const near = useInViewport(pondEl, false, '400px 0px')
const awake = ref(false)
watch(near, (n) => n && (awake.value = true))

// decorations
const LILY = [
  '....########....',
  '..##gggggggg##..',
  '.#gggghhgggggg#.',
  '#ggghhggggggggg#',
  '#gggggggggggggg#',
  '.#gggggggggggg#.',
  '..##gggggggg##..',
  '....########....',
]
const FLOWER = ['..p.p..', '.ppppp.', 'ppyyypp', '.ppppp.']
const REEDS = [
  '.c......c.',
  '.c...c..c.',
  '.c...c..c.',
  '.s...c..s.',
  '.s...s..s.',
  '.s...s.s..',
  '..s..s.s..',
  '..s..s.s..',
  '..s.s..s..',
  '..s.s..s..',
  '..s.s.s...',
  '..s.s.s...',
]
const BREAD = ['.##..##.', '#tt##tt#', '#tcccct#', '#tcccct#', '#tttttt#', '.######.']
const deco = { '#': '#2A1F3D', g: '#A8D5B5', h: '#CDEBD5', p: '#F4A6C8', y: '#FFE27A', s: '#6FA585', c: '#8B5E4A' }
const breadColors = { '#': '#2A1F3D', t: '#C98A4B', c: '#F6DFA6' }
</script>

<template>
  <section id="pond" aria-labelledby="pond-title" class="flex flex-col gap-7">
    <div class="flex flex-col gap-2">
      <h2 id="pond-title" class="m-0 font-pixel text-[clamp(32px,7vw,48px)] text-violet">{{ pond.title }}</h2>
      <p class="m-0 max-w-[560px] text-lg text-body">{{ pond.blurb }}</p>
    </div>

    <RetroWindow v-reveal title="pond.exe" title-color="lavender">
      <!-- clicking the water throws bread there; the button below does the same for keyboards -->
      <div
        ref="pondEl"
        class="pond-water relative h-[360px] overflow-hidden max-[640px]:h-[300px]"
        :class="{ 'is-paused': !running }"
        @click="onWaterClick"
      >
        <div v-if="awake" aria-hidden="true" class="pointer-events-none">
          <span class="absolute top-[14%] right-[12%]"><PixelSprite :grid="LILY" :palette="deco" :scale="4" /></span>
          <span class="absolute top-[calc(14%-6px)] right-[calc(12%+26px)]"><PixelSprite :grid="FLOWER" :palette="deco" :scale="4" /></span>
          <span class="absolute bottom-[10%] left-[8%]"><PixelSprite :grid="LILY" :palette="deco" :scale="3" /></span>
          <span class="absolute right-2 bottom-0"><PixelSprite :grid="REEDS" :palette="deco" :scale="5" /></span>
          <span
            v-for="c in crumbs"
            :key="c.id"
            class="crumb absolute"
            :style="{ left: `${c.x}px`, top: `${c.y}px`, rotate: `${(c.id * 37) % 90}deg` }"
          />
        </div>

        <ul v-if="awake" aria-label="Ducks in the pond" class="m-0 list-none p-0">
          <li v-for="(d, i) in shown" :key="i" :ref="(el) => setDuckEl(i, el as Element | null)" class="pond-duck">
            <button
              type="button"
              class="duck-btn"
              :aria-label="`${d.name}, a duck in the pond`"
              @click.stop="onDuckClick(i)"
              @focus="onDuckFocus(i, $event)"
              @blur="hold(i, false)"
              @pointerenter="hold(i, true)"
              @pointerleave="hold(i, false)"
            >
              <span class="duck-bounce">
                <span class="duck-bob" :style="{ animationDelay: bobDelays[i] }">
                  <span class="duck-sprite"><PixelDuck :color="d.color" /></span>
                </span>
              </span>
              <span class="duck-name">{{ d.name }}</span>
            </button>
            <p
              v-if="bubble?.duck === i"
              :ref="setBubbleEl"
              aria-hidden="true"
              class="duck-bubble"
              :class="{ 'is-below': bubble.below }"
            >{{ bubble.text }}</p>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-paper px-4 py-3">
        <span class="font-pixel text-base text-muted">{{ shown.length }} ducks paddling</span>
        <button
          type="button"
          class="press flex items-center gap-2 rounded-[10px] border-2 border-ink bg-butter px-4 py-2.5 font-pixel text-base font-semibold text-ink shadow-btn"
          @click="throwBreadAt()"
        >
          <PixelSprite :grid="BREAD" :palette="breadColors" :scale="2" />{{ pond.breadLabel }}
        </button>
      </div>
    </RetroWindow>

    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </section>
</template>
