import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import type { PondDuck } from '../content'
import {
  boundsFor,
  bubbleBelow,
  bubbleShift,
  makeDucks,
  nearestDuck,
  pickLine,
  randomPoint,
  clampToBounds,
  step,
  throwBread,
  type Bounds,
  type Crumb,
  type SimDuck,
} from '../lib/pond'
import { motionAllowed, prefersReducedMotion, restartAnimation, useInViewport, usePageVisible } from './useMotion'

const TALK_EVERY_MS: [number, number] = [4000, 7000]
const BUBBLE_MS = 3000
const EAT_LINES = ['nom!', 'mine!!', 'yum', '*nom nom*']

export interface Bubble {
  /** index into the shown ducks */
  duck: number
  text: string
  below: boolean
}

/**
 * Runs the pond: positions are written straight to each duck's element every frame (no Vue
 * re-render), while the bits Vue renders — speech bubble, crumbs, announcements — change
 * only a few times a second.
 */
export function usePond(ducks: readonly PondDuck[], genericLines: readonly string[], pondEl: Ref<HTMLElement | null>) {
  const duckEls: HTMLElement[] = []
  const bubbleEl = ref<HTMLElement | null>(null)
  const bubble = ref<Bubble | null>(null)
  const crumbView = shallowRef<Crumb[]>([])
  /** read out by a polite live region: only for things the visitor did */
  const announcement = ref('')

  // off-screen until the observer says otherwise, so the loop never runs during page load
  const inView = useInViewport(pondEl, false)
  const pageVisible = usePageVisible()
  const moving = computed(() => !prefersReducedMotion.value && motionAllowed())
  const running = computed(() => moving.value && inView.value && pageVisible.value)

  let size = { w: 0, h: 0 }
  let bounds: Bounds = boundsFor(size)
  let sim: SimDuck[] = []
  const crumbs: Crumb[] = []
  let nextCrumbId = 0
  let bubbleWidth = 0
  let lastLine: string | undefined
  let announceNextEat = false

  /** the ducks render after the pond does (see PondSection), so each is placed as it appears */
  function setDuckEl(i: number, el: Element | null) {
    if (!el) return
    duckEls[i] = el as HTMLElement
    if (sim[i]) place(sim[i], bubble.value?.duck)
  }

  function place(d: SimDuck, talking: number | undefined) {
    const el = duckEls[d.id]
    if (!el) return
    el.style.transform = `translate(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px)`
    // ducks further down the pond sit in front; the talking one above everything
    el.style.zIndex = String(d.id === talking ? 1000 : Math.round(d.y))
    el.dataset.facing = d.facing === 1 ? 'right' : 'left'
  }

  function render() {
    const talking = bubble.value?.duck
    for (const d of sim) place(d, talking)
    if (talking !== undefined && bubbleEl.value && sim[talking]) {
      bubbleEl.value.style.setProperty('--shift', `${bubbleShift(sim[talking].x, bubbleWidth, size.w)}px`)
    }
  }

  // --- the frame loop ---
  let raf = 0
  let last = 0
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000) // after a pause, don't jump
    last = now
    const r = step(sim, crumbs, bounds, dt)
    for (const e of r.eaten) {
      say(e.duckId, { text: EAT_LINES[Math.floor(Math.random() * EAT_LINES.length)] })
      if (announceNextEat) {
        announce(`Bread! ${ducks[e.duckId].name} got it.`)
        announceNextEat = false
      }
    }
    if (r.eaten.length || r.sunk.length) crumbView.value = [...crumbs]
    render()
    raf = requestAnimationFrame(frame)
  }
  function start() {
    if (raf) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  // --- talking ---
  let hideTimer: ReturnType<typeof setTimeout> | undefined
  let chatterTimer: ReturnType<typeof setTimeout> | undefined

  function announce(text: string) {
    // clear first so the same sentence twice is still read out
    announcement.value = ''
    nextTick(() => (announcement.value = text))
  }

  function say(i: number, opts: { text?: string; announce?: boolean } = {}) {
    const d = sim[i]
    if (!d) return
    const text = opts.text ?? pickLine(ducks[i].lines, genericLines, Math.random, lastLine)
    lastLine = text
    bubble.value = { duck: i, text, below: false }
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => (bubble.value = null), BUBBLE_MS)
    if (opts.announce) announce(`${ducks[i].name}: ${text}`)
    nextTick(() => {
      if (!bubbleEl.value || bubble.value?.duck !== i) return
      bubbleWidth = bubbleEl.value.offsetWidth
      bubble.value = { ...bubble.value, below: bubbleBelow(d.y, bubbleEl.value.offsetHeight) }
      render()
    })
  }

  function scheduleChatter() {
    clearTimeout(chatterTimer)
    const [min, max] = TALK_EVERY_MS
    chatterTimer = setTimeout(() => {
      if (sim.length) say(Math.floor(Math.random() * sim.length))
      scheduleChatter()
    }, min + Math.random() * (max - min))
  }

  // --- visitor actions ---
  function onDuckClick(i: number) {
    restartAnimation(duckEls[i]?.querySelector<HTMLElement>('.duck-bounce'), 'bounce')
    say(i, { announce: true })
  }
  function hold(i: number, held: boolean) {
    if (sim[i]) sim[i].held = held
  }
  function onDuckFocus(i: number, e: FocusEvent) {
    hold(i, true)
    // keyboard focus shows the bubble; a mouse click already does on its own
    if ((e.target as HTMLElement).matches(':focus-visible')) say(i)
  }

  /** Bread lands at a point in the pond (px), or somewhere in the middle. */
  function throwBreadAt(at?: { x: number; y: number }) {
    const inner = {
      minX: bounds.minX + (bounds.maxX - bounds.minX) * 0.2,
      maxX: bounds.maxX - (bounds.maxX - bounds.minX) * 0.2,
      minY: bounds.minY + (bounds.maxY - bounds.minY) * 0.2,
      maxY: bounds.maxY - (bounds.maxY - bounds.minY) * 0.2,
    }
    const thrown = throwBread(crumbs, at ?? randomPoint(inner), bounds, nextCrumbId)
    nextCrumbId += thrown.length
    crumbView.value = [...crumbs]

    if (moving.value) {
      announceNextEat = true
      return
    }
    // reduced motion: nobody swims; the nearest duck just gets it
    const eater = nearestDuck(sim, thrown[0].x, thrown[0].y)
    if (eater !== undefined) {
      say(eater, { text: 'nom!' })
      announce(`Bread! ${ducks[eater].name} got it.`)
    }
    setTimeout(() => {
      crumbs.length = 0
      crumbView.value = []
    }, 1200)
  }

  function onWaterClick(e: MouseEvent) {
    if (!pondEl.value || e.target !== e.currentTarget) return
    const rect = pondEl.value.getBoundingClientRect()
    throwBreadAt({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  // --- lifecycle ---
  let ro: ResizeObserver | undefined
  function measure() {
    if (!pondEl.value) return
    size = { w: pondEl.value.clientWidth, h: pondEl.value.clientHeight }
    bounds = boundsFor(size)
    if (!sim.length) sim = makeDucks(ducks.length, bounds)
    for (const d of sim) clampToBounds(d, bounds)
    render()
  }

  onMounted(() => {
    measure()
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(measure)
      if (pondEl.value) ro.observe(pondEl.value)
    }
    watch(
      running,
      (on) => {
        if (on) {
          start()
          scheduleChatter()
        } else {
          stop()
          clearTimeout(chatterTimer)
        }
      },
      { immediate: true },
    )
  })
  onBeforeUnmount(() => {
    stop()
    ro?.disconnect()
    clearTimeout(hideTimer)
    clearTimeout(chatterTimer)
  })

  return {
    setDuckEl,
    bubbleEl,
    bubble,
    crumbs: crumbView,
    announcement,
    running,
    onDuckClick,
    onDuckFocus,
    hold,
    throwBreadAt,
    onWaterClick,
  }
}
