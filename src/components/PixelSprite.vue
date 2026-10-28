<script lang="ts">
type Run = { x: number; y: number; w: number; c: string }

// one rect per horizontal run of the same character keeps the DOM small; worked out once
// per grid, since every duck shares the same one
const cache = new WeakMap<readonly string[], Run[]>()
function runsFor(grid: readonly string[]): Run[] {
  let runs = cache.get(grid)
  if (!runs) {
    runs = grid.flatMap((row, y) => {
      const out: Run[] = []
      for (let x = 0; x < row.length; x++) {
        const c = row[x]
        if (c === '.') continue
        const last = out.at(-1)
        if (last && last.c === c && last.x + last.w === x) last.w++
        else out.push({ x, y, w: 1, c })
      }
      return out
    })
    cache.set(grid, runs)
  }
  return runs
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

// Pixel art from a text grid: each character is one pixel, '.' is empty, and `palette`
// maps the other characters to colours.
const props = withDefaults(defineProps<{ grid: readonly string[]; palette: Record<string, string>; scale?: number }>(), {
  scale: 3,
})

const cols = computed(() => Math.max(...props.grid.map((r) => r.length)))
const runs = computed(() => runsFor(props.grid))
</script>

<template>
  <svg
    aria-hidden="true"
    focusable="false"
    :width="cols * scale"
    :height="grid.length * scale"
    :viewBox="`0 0 ${cols} ${grid.length}`"
    shape-rendering="crispEdges"
  >
    <rect v-for="(r, i) in runs" :key="i" :x="r.x" :y="r.y" :width="r.w" height="1" :fill="palette[r.c]" />
  </svg>
</template>
