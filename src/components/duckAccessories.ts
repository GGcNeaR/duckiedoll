// Things a pond duck can wear, drawn over the duck sprite in PixelDuck.vue (in list order,
// so later ones sit on top). `x`/`y` place the grid's top-left in duck pixels (the duck faces
// right; its head is at columns 8–13, rows 0–4, with the eye at column 11, row 2). Negative
// y pokes above the head. '.' cells are see-through.

export const duckAccessories = {
  'bat-mask': {
    label: 'wearing a bat mask',
    x: 8,
    y: -2,
    grid: [
      '.k..k.', // pointy ears
      '.k..k.',
      '.kkkk.',
      'kkkkkk',
      'kkkwkk', // eye showing through
    ],
    palette: { k: '#1B1622', w: '#FFFFFF' },
  },
  'swept-hair': {
    label: 'with swept-back black hair',
    x: 6,
    y: -3,
    grid: [
      '....hhh.', // volume on top
      '..hhhhhh',
      '.hhsshhh', // shine
      'hhhhhh..', // forehead stays clear for the glasses
      'hhh.....', // strands falling down the back
      'h.h.....',
      'h.......',
    ],
    palette: { h: '#1B1622', s: '#5A4E6B' },
  },
  glasses: {
    label: 'wearing glasses',
    x: 9,
    y: 1,
    grid: [
      '.kkkkk',
      'kk.llk', // arm, then the eye and the lens
      '.kkkkk',
    ],
    palette: { k: '#1B1622', l: '#CFE8F7' },
  },
} as const

export type DuckAccessory = keyof typeof duckAccessories
