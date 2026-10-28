<script setup lang="ts">
import { computed } from 'vue'
import PixelSprite from './PixelSprite.vue'
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

const props = withDefaults(defineProps<{ color?: string; scale?: number }>(), { color: '#FFE27A', scale: 3 })

const palette = computed(() => ({
  '#': '#2A1F3D',
  e: '#2A1F3D',
  b: '#F4A6C8',
  o: props.color,
  w: shade(props.color),
}))
</script>

<template>
  <PixelSprite :grid="GRID" :palette="palette" :scale="scale" />
</template>
