/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Base path. GitHub Pages serves under /<repo>/, so default to that.
// Override with VITE_BASE=/ when deploying to a root domain (Netlify/Vercel).
const env = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>
const base = env.VITE_BASE ?? '/getshitdone/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Get Shit Done',
        short_name: 'GSD',
        description: 'A voice-first task manager. Talk to it, get shit done.',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
})
