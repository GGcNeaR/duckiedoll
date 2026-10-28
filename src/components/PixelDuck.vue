<script setup lang="ts">
import { computed } from 'vue'
import PixelSprite from './PixelSprite.vue'
import { duckAccessories, type DuckAccessory } from './duckAccessories'
import { shade } from '../lib/pond'

// Swimming duck, side view facing right. o = body, w = wing (a shade of the body colour),
// b = beak, e = eye, # = ink outline.
const GRID = [
  '.........####....',
  '........#oooo#...',
  '........#ooeo#...',
  '........#oooo####',
  '........#ooo#bbb#',
  '#........#oo####.',
  '##......#oooo#...',
  '#o#######ooooo#..',
  '#ooooowwwwwoooo#.',
  '.#oooowwwwwwooo#.',
  '.#ooooowwwwoooo#.',
  '..#ooooooooooo#..',
  '...###########...',
]

const props = withDefaults(
  defineProps<{ color?: string; scale?: number; accessories?: readonly DuckAccessory[] }>(),
  { color: '#FFE27A', scale: 3, accessories: () => [] },
)

const palette = computed(() => ({
  '#': '#2A1F3D',
  e: '#2A1F3D',
  b: '#F4A6C8',
  o: props.color,
  w: shade(props.color),
}))
const extras = computed(() => props.accessories.map((a) => duckAccessories[a]))
</script>

<template>
  <span class="relative block">
    <PixelSprite :grid="GRID" :palette="palette" :scale="scale" />
    <PixelSprite
      v-for="(extra, i) in extras"
      :key="i"
      class="absolute"
      :style="{ left: `${extra.x * scale}px`, top: `${extra.y * scale}px` }"
      :grid="extra.grid"
      :palette="extra.palette"
      :scale="scale"
    />
  </span>
</template>
