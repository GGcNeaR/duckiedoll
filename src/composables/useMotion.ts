import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const reduceQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

/** Live "prefers-reduced-motion: reduce" flag (follows OS changes mid-visit). */
export const prefersReducedMotion = ref(reduceQuery?.matches ?? false)
reduceQuery?.addEventListener('change', (e) => (prefersReducedMotion.value = e.matches))

/** Motion was allowed when the page loaded (see the js-motion script in index.html). */
export function motionAllowed(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('js-motion') &&
    !prefersReducedMotion.value
  )
}

const pageVisible = ref(typeof document === 'undefined' || document.visibilityState === 'visible')
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => (pageVisible.value = document.visibilityState === 'visible'))
}

/** Whether the tab is currently visible. */
export function usePageVisible(): Ref<boolean> {
  return pageVisible
}

/** Whether an element is at least partly on screen. Assumes visible until told otherwise. */
export function useInViewport(el: Ref<Element | null>): Ref<boolean> {
  const inView = ref(true)
  let io: IntersectionObserver | undefined
  onMounted(() => {
    if (!el.value || !('IntersectionObserver' in window)) return
    io = new IntersectionObserver(([entry]) => (inView.value = entry.isIntersecting))
    io.observe(el.value)
  })
  onBeforeUnmount(() => io?.disconnect())
  return inView
}

/** Replay a CSS animation class on repeat triggers: remove it, force a reflow, re-add it. */
export function restartAnimation(el: HTMLElement | null | undefined, className: string) {
  if (!el) return
  el.classList.remove(className)
  void el.offsetWidth
  el.classList.add(className)
}
