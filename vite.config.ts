/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE: "/" for a custom domain or user site, "/<repo>/" for a project Pages site.
// SITE_URL: the site's full address. Link previews need absolute URLs for the page and image.
const siteUrl = new URL(process.env.SITE_URL || 'http://localhost:5173/').href.replace(/\/?$/, '/')

function siteUrlInHtml(): Plugin {
  return { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl) }
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), tailwindcss(), siteUrlInHtml()],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
