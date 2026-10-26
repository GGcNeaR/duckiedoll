// Builds the pixel-duck cursors in src/assets/cursors/ from the text grids below.
// Run after editing a grid: `npm run cursors:build`
//
// Each grid is 16×16 "logical" pixels, drawn at 2× (32px) with a 1px light halo around
// the whole shape so the duck stays visible on the dark panels too (34×34 total).

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PALETTE: Record<string, string> = {
  '#': '#2A1F3D', // ink outline
  o: '#FFE27A', // duck yellow
  w: '#F2C14E', // wing shade
  b: '#F4A6C8', // beak
  e: '#2A1F3D', // eye
  h: '#C2477F', // heart
  z: '#6B4FA0', // sleepy z
}
const HALO = '#F3EDFB'
const SCALE = 2
const PAD = 1

// facing left, beak tip at the top-left = the click point
const body = [
  '................',
  '................',
  '................',
  '....####........',
  '...#oooo#.......',
  '..#oeoooo#......',
  '###oooooo#......',
  '#bbbooooo#....##',
  '####ooooo#...#o#',
  '...#oooooo####o#',
  '..#ooowwwwooooo#',
  '..#oowwwwwwoooo#',
  '..#ooowwwwoooo#.',
  '...#oooooooooo#.',
  '....##########..',
  '................',
]

const cursors: Record<string, string[]> = {
  duck: body,
  // hovering something clickable: a little heart pops up
  'duck-point': overlay(body, [
    '...........h.h..',
    '..........hhhhh.',
    '...........hhh..',
    '............h...',
  ]),
  // pressing: quack! beak drops open
  'duck-quack': overlay(body, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '#####...........',
    '#bbb#...........',
    '###.............',
  ]),
  // loading: eye closed, z z
  'duck-sleep': overlay(body, [
    '..........zzz...',
    '............z...',
    '...........z....',
    '..........zzz...',
    '................',
    '....o...........',
    '...o##..........',
  ]),
}

/** Paint the non-'.' cells of `top` over `base`. */
function overlay(base: string[], top: string[]): string[] {
  const grid = base.map((row) => row.slice(0, 16).padEnd(16, '.').split(''))
  top.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && (grid[y][x] = c)))
  return grid.map((r) => r.join(''))
}

function toSvg(grid: string[]): string {
  const n = 16 * SCALE + PAD * 2
  const filled = (x: number, y: number) => {
    const gx = Math.floor((x - PAD) / SCALE)
    const gy = Math.floor((y - PAD) / SCALE)
    const c = grid[gy]?.slice(0, 16)[gx]
    return x >= PAD && y >= PAD && c !== undefined && c !== '.' ? c : null
  }
  // one <rect> per horizontal run of same-coloured pixels keeps the files small
  const rects: string[] = []
  for (let y = 0; y < n; y++) {
    let run: { x: number; color: string } | null = null
    const flush = (end: number) => {
      if (run) rects.push(`<rect x="${run.x}" y="${y}" width="${end - run.x}" height="1" fill="${run.color}"/>`)
      run = null
    }
    for (let x = 0; x <= n; x++) {
      const c = x < n ? filled(x, y) : null
      // halo: an empty pixel touching the shape
      const halo = x < n && !c && [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => filled(x + dx, y + dy)))
      const color = c ? PALETTE[c] : halo ? HALO : null
      if (run && run.color === color) continue
      flush(x)
      if (color) run = { x, color }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">${rects.join('')}</svg>\n`
}

const outDir = join(import.meta.dirname, '../../src/assets/cursors')
mkdirSync(outDir, { recursive: true })
for (const [name, grid] of Object.entries(cursors)) {
  writeFileSync(join(outDir, `${name}.svg`), toSvg(grid))
  console.log(`${name}.svg`)
}
