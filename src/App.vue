<script setup lang="ts">
import SiteNav from './components/SiteNav.vue'
import HeroSection from './sections/HeroSection.vue'
import AboutSection from './sections/AboutSection.vue'
import QuestsSection from './sections/QuestsSection.vue'
import ClipsSection from './sections/ClipsSection.vue'
import CommunitySection from './sections/CommunitySection.vue'
import SiteFooter from './sections/SiteFooter.vue'
import { NEW_TAB_NOTE_ID } from './lib/links'
</script>

<template>
  <div class="desk min-h-screen">
    <a
      href="#top"
      class="sr-only z-20 rounded-lg bg-butter px-4 py-3 font-pixel text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >skip to content</a>
    <SiteNav />
    <main id="top" tabindex="-1" class="mx-auto flex max-w-[1240px] flex-col gap-[72px] px-6 pt-12 outline-none">
      <HeroSection />
      <AboutSection />
      <QuestsSection />
      <ClipsSection />
      <CommunitySection />
    </main>
    <SiteFooter />
    <span :id="NEW_TAB_NOTE_ID" hidden>opens in a new tab</span>
  </div>
</template>
