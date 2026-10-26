/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE: "/" for a custom domain or user site, "/<repo>/" for a project Pages site.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
