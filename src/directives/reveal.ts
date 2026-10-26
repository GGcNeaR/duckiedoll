import type { Directive } from 'vue'
import { motionAllowed } from '../composables/useMotion'

// v-reveal: retro windows "open" (scale + fade) the first time they scroll into view.
// Usage: v-reveal or v-reveal="{ delay: i * 80 }" to stagger siblings in a row.

export interface RevealOptions {
  /** ms */
  delay?: number
}

let io: IntersectionObserver | null = null

function open(el: HTMLElement) {
  el.addEventListener('animationend', function done(e: AnimationEvent) {
    if (e.target !== el || e.animationName !== 'winOpen') return
    el.classList.add('reveal-done')
    el.removeEventListener('animationend', done)
  })
  el.classList.add('is-revealed')
}

function observer(): IntersectionObserver {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        io!.unobserve(entry.target)
        open(entry.target as HTMLElement)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  )
  return io
}

export const vReveal: Directive<HTMLElement, RevealOptions | undefined> = {
  beforeMount(el, { value }) {
    el.dataset.reveal = ''
    if (value?.delay) el.style.animationDelay = `${value.delay}ms`
  },
  mounted(el) {
    if (!motionAllowed() || !('IntersectionObserver' in window)) {
      el.classList.add('is-revealed', 'reveal-done')
      return
    }
    observer().observe(el)
  },
  beforeUnmount(el) {
    io?.unobserve(el)
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
  }
}
